import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import PhoneCard from '@/components/PhoneCard';
import CategorySidebar from '@/components/CategorySidebar';
import FilterModal from '@/components/FilterModal';
import { SAMPLE_PHONES } from '@/lib/demo-data';
import { Phone as PhoneType } from '@/lib/types';
import connectDB from '@/lib/mongodb';
import PhoneModel from '@/models/Phone';

interface HomePageProps {
  searchParams?: Promise<{
    q?: string;
    sort?: string;
    brand?: string;
    priceRange?: string;
  }>;
}

async function PhoneResults({ 
  query, 
  sort, 
  brands = [], 
  priceRanges = [] 
}: { 
  query?: string; 
  sort?: string; 
  brands?: string[]; 
  priceRanges?: string[];
}) {
  let phones: PhoneType[] = [];
  let usingDemo = false;

  // Try to load real phones from MongoDB first
  try {
    await connectDB();
    const dbPhones = await PhoneModel.find({})
      .sort({ isFeatured: -1, popularityScore: -1, createdAt: -1 })
      .limit(120)
      .lean<PhoneType[]>();

    if (dbPhones && dbPhones.length > 0) {
      phones = dbPhones;
    } else {
      usingDemo = true;
      phones = [...SAMPLE_PHONES];
    }
  } catch (err) {
    console.error('Homepage DB fetch failed, using demo data:', err);
    usingDemo = true;
    phones = [...SAMPLE_PHONES];
  }

  // Start filtering from whatever source we have (real DB or demo)
  let filtered = [...phones];

  // Apply text search
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
  }

  // Multi-brand filter (supports the new separate FilterPanel + sidebar)
  if (brands.length > 0) {
    filtered = filtered.filter(p => 
      brands.some(b => p.brand.toLowerCase() === b.toLowerCase())
    );
  }

  // Multi price range filter (supports the new separate FilterPanel + sidebar)
  if (priceRanges.length > 0) {
    filtered = filtered.filter(p => {
      const pkr = p.pricePKR ?? (p as any).price ?? 0;
      return priceRanges.some(range => {
        if (range === 'under-20000') return pkr < 20000;
        if (range === '20000-40000') return pkr >= 20000 && pkr < 40000;
        if (range === '40000-80000') return pkr >= 40000 && pkr < 80000;
        if (range === 'above-80000') return pkr >= 80000;
        return true;
      });
    });
  }

  // Apply sorting
  const getPrice = (p: any) => p.pricePKR ?? p.price ?? 0;

  if (sort === 'price-low') {
    filtered.sort((a, b) => getPrice(a) - getPrice(b));
  } else if (sort === 'price-high') {
    filtered.sort((a, b) => getPrice(b) - getPrice(a));
  } else {
    // Default: featured first, then price
    filtered.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return getPrice(a) - getPrice(b);
    });
  }

  phones = filtered;

  return (
    <div>
      {usingDemo && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-700">
          Showing <strong>demo phones</strong> (no real data found in DB).
        </div>
      )}

      <div className="flex items-center justify-between mb-5 text-sm">
        <div className="text-gray-600">
          {query ? (
            <>Results for <span className="font-semibold text-gray-900">“{query}”</span></>
          ) : (priceRanges.length > 0 || brands.length > 0) ? (
            <>Filtered phones (applied filters)</>
          ) : (
            'All mobile phones in Pakistan'
          )}
          <span className="ml-2 text-gray-400">({phones.length} phones)</span>
        </div>
      </div>

      {phones.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-1.5">
          {phones.map((phone) => (
            <PhoneCard key={phone.slug} phone={phone} compact />
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-2xl p-10 text-center">
          <p className="text-xl mb-2">No phones found matching the filters</p>
          <p className="text-gray-500">Try different filters using the panel above or left sidebar.</p>
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: HomePageProps) {
  const params = (await searchParams) || {};
  const query = params.q || '';
  const sort = params.sort || 'popular';
  const brandParam = params.brand || '';
  const priceRangeParam = params.priceRange || '';

  // Parse multi-value filters from comma-separated params (supports both sidebar single + new multi filter)
  const priceRanges = priceRangeParam ? priceRangeParam.split(',').filter(Boolean) : [];
  const brands = brandParam ? brandParam.split(',').filter(Boolean) : [];

  // Helper to build sort links — clicking sort resets any active category/price filters from sidebar
  // (sort is treated as a top-level action on the full list or search results)
  const buildSortHref = (newSort: string) => {
    const sp = new URLSearchParams();
    if (query) sp.set('q', query);
    sp.set('sort', newSort);
    // Do NOT carry over priceRange or brand — this resets the sidebar selection
    return `/?${sp.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-4">
        {/* LEFT SIDEBAR - All Categories */}
        <CategorySidebar />

        {/* MAIN CONTENT - Phones based on selected category */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">Mobile Phones in Pakistan</h1>
            <p className="text-gray-600 mt-1">
              Select any category from the left sidebar to filter the phones instantly.
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar 
            initialQuery={query} 
            className="max-w-2xl mb-6" 
            placeholder="Search phones by name or brand..." 
          />



          {/* Controls row: Sort + Clear + Filters button (popup) */}
          <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
            {[
              { label: 'Popular', value: 'popular' },
              { label: 'Price: Low to High', value: 'price-low' },
              { label: 'Price: High to Low', value: 'price-high' },
              { label: 'Newest', value: 'newest' },
            ].map((option) => {
              const isActive = sort === option.value;
              return (
                <a
                  key={option.value}
                  href={buildSortHref(option.value)}
                  className={`px-4 py-1.5 rounded-full border transition ${isActive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                >
                  {option.label}
                </a>
              );
            })}

            {/* Easy reset for sidebar / applied filters */}
            {(priceRanges.length > 0 || brands.length > 0) && (
              <a 
                href="/" 
                className="ml-2 text-xs text-emerald-600 hover:text-emerald-700 underline"
              >
                Clear filters
              </a>
            )}

            {/* Separate popup filter button - opens advanced multi-select filters */}
            <FilterModal />
          </div>

          {/* Phones Grid - filtered by left sidebar selection */}
          <Suspense fallback={<div className="py-12 text-center text-gray-500">Loading phones...</div>}>
            <PhoneResults 
              query={query} 
              sort={sort} 
              brands={brands} 
              priceRanges={priceRanges} 
            />
          </Suspense>

          <div className="mt-8 text-xs text-gray-400">
            Phones from your MongoDB will appear here automatically. Use left sidebar or Filters for categories.
          </div>
        </div>
      </div>
    </div>
  );
}

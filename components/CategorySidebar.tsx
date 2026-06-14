'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const priceRanges = [
  { label: 'All Phones', slug: 'all' },
  { label: 'Under 20,000', slug: 'under-20000' },
  { label: '20,000 - 40,000', slug: '20000-40000' },
  { label: '40,000 - 80,000', slug: '40000-80000' },
  { label: 'Above 80,000', slug: 'above-80000' },
];

const popularBrands = [
  { name: 'Samsung', slug: 'samsung' },
  { name: 'Apple', slug: 'apple' },
  { name: 'Xiaomi', slug: 'xiaomi' },
  { name: 'Infinix', slug: 'infinix' },
  { name: 'Realme', slug: 'realme' },
  { name: 'Vivo', slug: 'vivo' },
  { name: 'Oppo', slug: 'oppo' },
  { name: 'Tecno', slug: 'tecno' },
  { name: 'Motorola', slug: 'motorola' },
];

export default function CategorySidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPrice = searchParams.get('priceRange') || '';
  const currentBrand = searchParams.get('brand') || '';

  // Build href for price category on the main browsing view (homepage or /search)
  const getBasePath = () => (pathname === '/' ? '/' : '/search');

  const getPriceHref = (slug: string) => {
    const base = getBasePath();
    if (slug === 'all') {
      return base;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set('priceRange', slug);
    params.delete('brand');
    return `${base}?${params.toString()}`;
  };

  const getBrandHref = (slug: string) => {
    const base = getBasePath();
    const params = new URLSearchParams(searchParams.toString());
    params.set('brand', slug);
    params.delete('priceRange');
    return `${base}?${params.toString()}`;
  };

  const isPriceActive = (slug: string) => {
    const onMain = pathname === '/search' || pathname === '/';
    if (slug === 'all') {
      return onMain && !currentPrice && !currentBrand;
    }
    return onMain && currentPrice === slug;
  };

  const isBrandActive = (slug: string) => {
    const onMain = pathname === '/search' || pathname === '/';
    return onMain && currentBrand === slug;
  };

  // For other pages (prices/[range] or brands pages), fall back to old navigation behavior
  const isOnSearch = pathname === '/search' || pathname === '/';

  return (
    <aside className="w-52 flex-shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-6">
        {/* Price Categories */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b font-semibold text-sm text-gray-700">
            Price Categories
          </div>
          <nav className="py-1">
            {priceRanges.map((range) => {
              const active = isPriceActive(range.slug);
              const href = isOnSearch ? getPriceHref(range.slug) : (range.slug === 'all' ? '/search' : `/prices/${range.slug}`);
              return (
                <Link
                  key={range.slug}
                  href={href}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 font-medium border-l-4 border-emerald-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-700'
                  }`}
                >
                  <span>{range.label}</span>
                  {active && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Brands */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b font-semibold text-sm text-gray-700">
            Popular Brands
          </div>
          <nav className="py-1">
            {popularBrands.map((brand) => {
              const active = isBrandActive(brand.slug);
              const href = isOnSearch ? getBrandHref(brand.slug) : `/brands/${brand.slug}`;
              return (
                <Link
                  key={brand.slug}
                  href={href}
                  className={`flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 font-medium border-l-4 border-emerald-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-700'
                  }`}
                >
                  <span>{brand.name}</span>
                  {active && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
            <Link
              href="/brands"
              className="flex items-center px-4 py-2.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium border-t mt-1 pt-3"
            >
              View All Brands →
            </Link>
          </nav>
        </div>

        {/* Quick Tip */}
        <div className="text-[11px] px-4 text-gray-400 leading-relaxed">
          Prices are indicative and may vary by retailer in Pakistan.
        </div>
      </div>
    </aside>
  );
}

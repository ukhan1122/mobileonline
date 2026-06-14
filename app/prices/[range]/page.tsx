import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Phone from '@/models/Phone';
import PhoneCard from '@/components/PhoneCard';
import CategorySidebar from '@/components/CategorySidebar';
import DatabaseSetupNotice from '@/components/DatabaseSetupNotice';
import { Phone as PhoneType } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PriceRangePageProps {
  params: Promise<{ range: string }>;
}

const PRICE_RANGES: Record<string, { label: string; min: number; max: number | null }> = {
  'under-20000': { label: 'Under 20,000', min: 0, max: 20000 },
  '20000-40000': { label: '20,000 - 40,000', min: 20000, max: 40000 },
  '40000-80000': { label: '40,000 - 80,000', min: 40000, max: 80000 },
  'above-80000': { label: 'Above 80,000', min: 80000, max: null },
};

export async function generateStaticParams() {
  return Object.keys(PRICE_RANGES).map((range) => ({ range }));
}

export default async function PriceRangePage({ params }: PriceRangePageProps) {
  const { range } = await params;
  const rangeConfig = PRICE_RANGES[range];

  if (!rangeConfig) {
    notFound();
  }

  let phones: PhoneType[] = [];

  try {
    await connectDB();

    const filter: any = {
      price: { $gte: rangeConfig.min },
    };
    if (rangeConfig.max !== null) {
      filter.price.$lte = rangeConfig.max;
    }

    phones = (await Phone.find(filter)
      .sort({ price: 1, popularityScore: -1 })
      .limit(80)
      .lean()) as unknown as PhoneType[];
  } catch (error: any) {
    const msg = (error?.message || '').toLowerCase();
    const isMissingDB =
      !process.env.MONGODB_URI ||
      msg.includes('mongodb_uri') ||
      msg.includes('econnrefused') ||
      msg.includes('querysrv') ||
      msg.includes('atlas connection failed') ||
      msg.includes('database connection failed');

    if (isMissingDB) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-9">
          <div className="flex gap-4">
            <CategorySidebar />
            <div className="flex-1 min-w-0">
              <DatabaseSetupNotice />
            </div>
          </div>
        </div>
      );
    }

    // Other DB errors
    return (
      <div className="max-w-7xl mx-auto px-4 py-9">
        <div className="flex gap-4">
          <CategorySidebar />
          <div className="flex-1 min-w-0">
            <div className="bg-white border rounded-2xl p-12 text-center">
              <p className="text-red-600 font-medium">Database error</p>
              <p className="text-gray-500 mt-2 text-sm">{error?.message || 'Failed to load phones.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-9">
      <div className="flex gap-4">
        <CategorySidebar />

        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-[2px] text-emerald-600 font-semibold">PRICE RANGE</div>
            <h1 className="text-4xl font-semibold tracking-tighter">{rangeConfig.label} PKR</h1>
            <p className="text-gray-600 mt-1">
              Showing {phones.length} phones in this price segment. Prices updated regularly.
            </p>
          </div>

          {phones.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-1.5">
              {phones.map((phone) => (
                <PhoneCard key={phone.slug} phone={phone} compact />
              ))}
            </div>
          ) : (
            <div className="bg-white border rounded-2xl p-12 text-center">
              <p className="text-lg">No phones currently listed in this range.</p>
              <p className="text-sm mt-1 text-gray-500">New phones are added every day. Try another range.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

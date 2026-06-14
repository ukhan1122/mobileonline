import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Phone from '@/models/Phone';
import PhoneCard from '@/components/PhoneCard';
import CategorySidebar from '@/components/CategorySidebar';
import DatabaseSetupNotice from '@/components/DatabaseSetupNotice';
import { Phone as PhoneType } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BrandPageProps) {
  const { slug } = await params;
  const brandName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${brandName} Mobile Phones Prices in Pakistan`,
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brandQuery = slug.replace(/-/g, ' ');

  let phones: PhoneType[] = [];

  try {
    await connectDB();

    phones = (await Phone.find({
      brand: { $regex: new RegExp(`^${brandQuery}$`, 'i') },
    })
      .sort({ price: 1 })
      .limit(80)
      .lean()) as unknown as PhoneType[];

    if (!phones.length) {
      phones = (await Phone.find({
        brand: { $regex: brandQuery, $options: 'i' },
      })
        .sort({ price: 1 })
        .limit(50)
        .lean()) as unknown as PhoneType[];
    }
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-4">
            <CategorySidebar />
            <div className="flex-1 min-w-0">
              <DatabaseSetupNotice />
            </div>
          </div>
        </div>
      );
    }
    throw error;
  }

  if (!phones.length) {
    notFound();
  }

  const displayBrand = phones[0]?.brand || brandQuery;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-4">
        <CategorySidebar />

        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <div className="text-emerald-600 uppercase text-sm tracking-[2px] font-semibold">BRAND</div>
            <h1 className="text-4xl font-semibold tracking-tighter">{displayBrand} Phones</h1>
            <p className="text-gray-600 mt-1">{phones.length} models currently listed in Pakistan</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-1.5">
            {phones.map((phone) => (
              <PhoneCard key={phone.slug} phone={phone} showBrand={false} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

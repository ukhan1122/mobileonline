import BrandCard from '@/components/BrandCard';
import CategorySidebar from '@/components/CategorySidebar';
import connectDB from '@/lib/mongodb';
import Phone from '@/models/Phone';
import DatabaseSetupNotice from '@/components/DatabaseSetupNotice';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'All Mobile Phone Brands in Pakistan',
};

export default async function BrandsPage() {
  let brands: any[] = [];

  try {
    await connectDB();

    const brandStats = await Phone.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    brands = brandStats.map((b: any) => ({
      name: b._id,
      slug: b._id.toLowerCase().replace(/\s+/g, '-'),
      phoneCount: b.count,
    }));
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
    throw error;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-9">
      <div className="flex gap-4">
        <CategorySidebar />

        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">Mobile Brands in Pakistan</h1>
          <p className="text-gray-600 mb-8">Browse phones by manufacturer</p>

          {brands.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {brands.map((brand) => (
                <BrandCard key={brand.slug} name={brand.name} slug={brand.slug} phoneCount={brand.phoneCount} />
              ))}
            </div>
          ) : (
            <div className="bg-white border rounded-xl p-8">
              <p>No brands found yet. Add some phones to your database.</p>
              <p className="text-sm mt-2 text-gray-500">Use the seed script or admin to populate data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

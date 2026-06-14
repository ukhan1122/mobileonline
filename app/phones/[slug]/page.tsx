import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Phone from '@/models/Phone';
import DatabaseSetupNotice from '@/components/DatabaseSetupNotice';
import { Phone as PhoneType } from '@/lib/types';
import Link from 'next/link';
import GlobalPrice from '@/components/GlobalPrice';

export const dynamic = 'force-dynamic';

interface PhonePageProps {
  params: Promise<{ slug: string }>;
}

export default async function PhoneDetailPage({ params }: PhonePageProps) {
  const { slug } = await params;

  let phone: PhoneType | null = null;

  try {
    await connectDB();
    const phoneDoc = await Phone.findOne({ slug: slug.toLowerCase() }).lean();
    phone = phoneDoc as unknown as PhoneType | null;
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
      return <DatabaseSetupNotice />;
    }
    throw error;
  }

  if (!phone) {
    notFound();
  }

  // We use the async GlobalPrice component below for dynamic currency display.
  // The old formattedPrice using phone.price has been replaced.

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-emerald-700">Home</Link>
        {' / '}
        <Link href={`/brands/${phone.brand.toLowerCase()}`} className="hover:text-emerald-700">{phone.brand}</Link>
        {' / '}
        <span className="text-gray-900">{phone.name}</span>
      </div>

      <div className="grid md:grid-cols-5 gap-9">
        {/* Image + Price Card */}
        <div className="md:col-span-2">
          <div className="bg-white border rounded-3xl p-8 flex items-center justify-center h-[340px] mb-4">
            {phone.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={phone.image} alt={phone.name} className="max-h-[260px] object-contain" />
            ) : (
              <div className="text-center text-gray-300">
                <div className="text-7xl mb-3">📱</div>
                <div>No image available</div>
              </div>
            )}
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <GlobalPrice 
              phone={phone} 
              className="" 
            />
            <div className="text-xs mt-4 text-gray-500">* Price shown is fixed. Check retailer for offers and variants.</div>

            <a
              href="#"
              className="mt-5 block text-center w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium py-3 rounded-2xl transition"
            >
              View Offers
            </a>
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-3">
          <div className="mb-2">
            <span className="text-emerald-700 text-sm font-semibold uppercase tracking-[1px]">{phone.brand}</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tighter leading-none mb-3">{phone.name}</h1>

          {phone.releaseDate && (
            <div className="inline-block text-sm bg-gray-100 px-3 py-0.5 rounded-full mb-4">Released: {phone.releaseDate}</div>
          )}



          {/* Full Specs - Rich like PriceOye / WhatMobile */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-semibold text-lg mb-4">Full Specifications</h2>

            {/* Core quick specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 text-sm mb-8">
              <div className="space-y-4">
                {phone.specs.display && (
                  <>
                    <SpecRow label="Display" value={`${phone.specs.display.size ?? ''} • ${phone.specs.display.type ?? ''}`} />
                    <SpecRow label="Resolution" value={phone.specs.display.resolution} />
                    {phone.specs.display.refreshRate && <SpecRow label="Refresh Rate" value={phone.specs.display.refreshRate} />}
                    {phone.specs.display.protection && <SpecRow label="Protection" value={phone.specs.display.protection} />}
                  </>
                )}
                <SpecRow label="Processor" value={phone.specs.performance?.processor ?? (phone.specs as any).processor} />
                {phone.specs.performance?.gpu && <SpecRow label="GPU" value={phone.specs.performance.gpu} />}
                <SpecRow label="Operating System" value={phone.specs.os} />
              </div>

              <div className="space-y-4">
                <SpecRow label="Rear Camera" value={phone.specs.camera?.rear ?? phone.specs.mainCamera} />
                <SpecRow label="Front Camera" value={phone.specs.camera?.front ?? phone.specs.selfieCamera} />
                <SpecRow label="Battery" value={phone.specs.battery?.capacity ?? (phone.specs as any).battery} />
                {phone.specs.battery?.charging && <SpecRow label="Charging" value={phone.specs.battery.charging} />}
                {phone.specs.connectivity && <SpecRow label="Connectivity" value={phone.specs.connectivity} />}
                {phone.colors && phone.colors.length > 0 && <SpecRow label="Colors" value={phone.colors.join(', ')} />}
              </div>
            </div>

            {/* Rich categorized specifications */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3 text-base">Detailed Specifications</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                {/* General / Body */}
                <div>
                  <div className="font-medium text-emerald-700 mb-2 border-b pb-1">General</div>
                  <SpecRow label="Release Date" value={phone.releaseDate} />
                  <SpecRow label="SIM" value={phone.specs.sim} />
                  <SpecRow label="Dimensions" value={phone.specs.body?.dimensions} />
                  <SpecRow label="Weight" value={phone.specs.weight} />
                  <SpecRow label="Build" value={phone.specs.body?.build} />
                </div>

                {/* Memory & Performance */}
                <div>
                  <div className="font-medium text-emerald-700 mb-2 border-b pb-1">Memory & Performance</div>
                  <SpecRow label="RAM" value={phone.specs.memory?.ram} />
                  <SpecRow label="Storage" value={phone.specs.memory?.storage} />
                  <SpecRow label="Card Slot" value={phone.specs.memory?.cardSlot} />
                  <SpecRow label="Chipset / Processor" value={phone.specs.performance?.processor} />
                  <SpecRow label="GPU" value={phone.specs.performance?.gpu} />
                </div>

                {/* Main Camera */}
                <div>
                  <div className="font-medium text-emerald-700 mb-2 border-b pb-1">Main Camera</div>
                  <SpecRow label="Rear Camera" value={phone.specs.camera?.rear} />
                  <SpecRow label="Features" value={phone.specs.mainCamera?.features} />
                  <SpecRow label="Video" value={phone.specs.mainCamera?.video} />
                </div>

                {/* Selfie Camera */}
                <div>
                  <div className="font-medium text-emerald-700 mb-2 border-b pb-1">Selfie Camera</div>
                  <SpecRow label="Front Camera" value={phone.specs.camera?.front} />
                  <SpecRow label="Features" value={phone.specs.selfieCamera?.features} />
                  <SpecRow label="Video" value={phone.specs.selfieCamera?.video} />
                </div>

                {/* Battery & Sound */}
                <div>
                  <div className="font-medium text-emerald-700 mb-2 border-b pb-1">Battery & Sound</div>
                  <SpecRow label="Battery Capacity" value={phone.specs.battery?.capacity} />
                  <SpecRow label="Charging" value={phone.specs.battery?.charging} />
                  <SpecRow label="Loudspeaker" value={phone.specs.sound?.loudspeaker} />
                  <SpecRow label="3.5mm Jack" value={phone.specs.sound?.jack} />
                </div>

                {/* Comms & Features */}
                <div>
                  <div className="font-medium text-emerald-700 mb-2 border-b pb-1">Comms & Features</div>
                  <SpecRow label="WLAN / WiFi" value={phone.specs.comms?.wlan} />
                  <SpecRow label="Bluetooth" value={phone.specs.comms?.bluetooth} />
                  <SpecRow label="GPS / Positioning" value={phone.specs.comms?.gps} />
                  <SpecRow label="NFC" value={phone.specs.comms?.nfc} />
                  <SpecRow label="Radio" value={phone.specs.comms?.radio} />
                  <SpecRow label="USB" value={phone.specs.comms?.usb} />
                  <SpecRow label="Sensors" value={phone.specs.features?.sensors} />
                </div>


              </div>

              {/* Everything else from the table (the "full" data) */}
              {phone.specs.other && Object.keys(phone.specs.other).length > 0 && (
                <div className="mt-8">
                  <div className="font-medium text-emerald-700 mb-2 border-b pb-1">Additional / Full Table Specs</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    {Object.entries(phone.specs.other).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b py-0.5">
                        <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-medium text-right max-w-[55%]">{formatSpecValue(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {phone.description && (
              <div className="mt-6 pt-6 border-t text-sm text-gray-700 leading-relaxed">
                {phone.description}
              </div>
            )}
          </div>

          <div className="mt-6 text-xs text-gray-500">
            Data shown is for informational purposes. Verify current pricing before purchase.
          </div>
        </div>
      </div>
    </div>
  );
}

function formatSpecValue(val: any): string {
  if (val == null) return '';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  if (Array.isArray(val)) {
    return val.map(formatSpecValue).filter(Boolean).join(', ');
  }
  if (typeof val === 'object') {
    // Common richer patterns users paste
    if (val.main) {
      return val.main + (val.flash ? ' (with flash)' : '');
    }
    if (val.capacity) {
      return val.capacity + (val.type ? ` (${val.type})` : '');
    }
    // Generic object fallback: turn into readable key: value pairs
    return Object.entries(val)
      .map(([k, v]) => `${k}: ${formatSpecValue(v)}`)
      .join(' • ');
  }
  return String(val);
}

function SpecRow({ label, value }: { label: string; value: any }) {
  const display = formatSpecValue(value);
  if (!display) return null;
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-0.5">{label}</div>
      <div className="font-medium text-gray-900">{display}</div>
    </div>
  );
}

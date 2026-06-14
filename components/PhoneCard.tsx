import Link from 'next/link';
import { Phone } from '@/lib/types';
import { Star } from 'lucide-react';
import GlobalPrice from './GlobalPrice';

interface PhoneCardProps {
  phone: Phone;
  showBrand?: boolean;
  compact?: boolean; // for dense listings
}

export default function PhoneCard({ phone, showBrand = true, compact = false }: PhoneCardProps) {
  return (
    <Link
      href={`/phones/${phone.slug}`}
      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-emerald-400 hover:shadow transition-all duration-150"
    >
      {/* Compact image area */}
      <div className="relative h-24 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center overflow-hidden">
        {phone.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={phone.image}
            alt={phone.name}
            className="h-[80%] w-auto object-contain group-hover:scale-[1.05] transition-transform duration-200"
          />
        ) : (
          <div className="text-3xl text-gray-300">📱</div>
        )}

        {phone.isFeatured && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-emerald-600 text-white text-[9px] font-semibold px-1.5 py-px rounded">
            <Star className="h-2.5 w-2.5" /> BEST
          </div>
        )}
      </div>

      <div className={compact ? "p-2" : "p-2.5"}>
        {showBrand && (
          <div className="uppercase text-emerald-700 text-[10px] font-semibold tracking-wider leading-none mb-0.5">
            {phone.brand}
          </div>
        )}

        <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
          {phone.name}
        </h3>

        <div className="mt-2">
          <GlobalPrice 
            phone={phone} 
            className="font-semibold text-gray-900 tabular-nums tracking-tighter" 
          />
        </div>

        {phone.inStock === false && (
          <span className="mt-1 inline-block text-[9px] px-1.5 py-px bg-red-100 text-red-600 rounded">Out of stock</span>
        )}
      </div>
    </Link>
  );
}

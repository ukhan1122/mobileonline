import Link from 'next/link';

interface BrandCardProps {
  name: string;
  slug: string;
  phoneCount?: number;
}

const brandColors: Record<string, string> = {
  samsung: 'bg-blue-600',
  apple: 'bg-zinc-900',
  xiaomi: 'bg-orange-500',
  infinix: 'bg-purple-600',
  realme: 'bg-yellow-500 text-black',
  vivo: 'bg-sky-600',
  oppo: 'bg-rose-600',
  tecno: 'bg-emerald-600',
  motorola: 'bg-indigo-600',
};

export default function BrandCard({ name, slug, phoneCount }: BrandCardProps) {
  const colorClass = brandColors[slug.toLowerCase()] || 'bg-gray-700';

  return (
    <Link
      href={`/brands/${slug}`}
      className="flex items-center gap-4 border border-gray-200 rounded-2xl p-4 hover:border-gray-300 hover:shadow-sm transition bg-white group"
    >
      <div className={`w-11 h-11 rounded-xl flex-shrink-0 ${colorClass} flex items-center justify-center text-white text-lg font-bold shadow-inner`}>
        {name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{name}</div>
        {phoneCount !== undefined && (
          <div className="text-xs text-gray-500">{phoneCount} phones listed</div>
        )}
      </div>
    </Link>
  );
}

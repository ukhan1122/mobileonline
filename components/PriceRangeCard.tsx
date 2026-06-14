import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface PriceRangeCardProps {
  label: string;
  min: number;
  max: number | null;
  count?: number;
  href: string;
}

export default function PriceRangeCard({ label, min, max, count, href }: PriceRangeCardProps) {
  const format = (amount: number) =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(amount);

  const rangeText = max
    ? `${format(min)} — ${format(max)}`
    : `${format(min)}+`;

  return (
    <Link
      href={href}
      className="group flex flex-col justify-between bg-white border border-gray-200 rounded-2xl p-5 hover:border-emerald-400 hover:shadow transition-all"
    >
      <div>
        <div className="text-xs font-medium uppercase tracking-widest text-emerald-600 mb-1">PRICE RANGE</div>
        <div className="text-2xl font-semibold text-gray-900">{label}</div>
        <div className="text-lg mt-1 font-medium text-gray-700 tabular-nums tracking-tight">{rangeText}</div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="text-emerald-700 font-medium group-hover:underline flex items-center gap-1">
          View phones <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
        {typeof count === 'number' && (
          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{count} phones</span>
        )}
      </div>
    </Link>
  );
}

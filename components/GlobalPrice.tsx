import { getUserCurrency, formatCurrency, formatPKR } from '@/lib/currency';
import { Phone } from '@/lib/types';

interface GlobalPriceProps {
  phone: Phone;
  className?: string;
}

export default async function GlobalPrice({ 
  phone, 
  className = '' 
}: GlobalPriceProps) {
  const { country, currency } = await getUserCurrency();

  const isPakistan = currency === 'PKR' || country?.toLowerCase().includes('pakistan');

  // Support legacy data (old `price` field) as fallback
  const pkrPrice = phone.pricePKR ?? (phone as any).price ?? 0;
  const usdPrice = phone.priceUSD ?? Math.round(((phone as any).price ?? 0) * 0.0036);

  if (isPakistan) {
    // Pakistan users: show ONLY PKR price. No USD text at all.
    const formatted = formatPKR(pkrPrice);
    return (
      <div className={className}>
        <div className="text-xs sm:text-sm font-semibold tracking-tight tabular-nums">
          {formatted}
        </div>
      </div>
    );
  }

  // Non-Pakistan users: show ONLY USD price. No PKR text.
  const formatted = formatCurrency(usdPrice, 'USD');
  return (
    <div className={className}>
      <div className="text-xs sm:text-sm font-semibold tracking-tight tabular-nums">
        {formatted}
      </div>
    </div>
  );
}

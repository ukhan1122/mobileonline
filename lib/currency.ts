import { headers } from 'next/headers';

/**
 * Best free methods for 2026 in Next.js (no API keys required for basic use):
 * 
 * - Country + Currency detection: ipwho.is (free, no signup, returns country, country_code, currency)
 *   Limits: Generous for personal/low-traffic sites. ~10k req/day practical.
 * 
 * - Currency conversion: frankfurter.app (free, ECB rates, no key, very reliable)
 *   Endpoint: https://api.frankfurter.app/latest?amount=1&from=USD&to=EUR,PKR,INR
 *   Updated daily. Perfect for approximate pricing.
 * 
 * Alternative for conversion if needed: https://open.er-api.com/v6/latest/USD (free tier)
 * 
 * For production:
 * - Cache rates with Next.js fetch revalidate (daily is fine for prices).
 * - Cache user location per IP or use short revalidate (1 hour).
 * - For high traffic, consider paid like ipinfo.io or abstractapi.
 * 
 * Dev note: On localhost, IP detection falls back to Pakistan (your main market).
 * You can test other countries by appending ?testCountry=US to any URL (handled in getUserCurrency).
 */

export interface UserCurrency {
  country: string;
  currency: string; // e.g. 'PKR', 'USD', 'INR', 'EUR'
}

const DEFAULT_LOCATION: UserCurrency = { country: 'Pakistan', currency: 'PKR' };

/**
 * Get user's country and currency code.
 * Runs on server (RSC or Route Handler).
 */
export async function getUserCurrency(): Promise<UserCurrency> {
  try {
    const headersList = await headers();
    
    // Support testing: append ?testCountry=US (or IN, etc.) to force international view (USD only)
    // For Pakistan (default for this app): do not use testCountry, it will show PKR only
    const url = headersList.get('x-url') || '';
    const search = url.includes('?') ? url.split('?')[1] : '';
    const testCountry = new URLSearchParams(search).get('testCountry');
    const testCurrency = new URLSearchParams(search).get('testCurrency');
    
    if (testCurrency) {
      return { country: 'Test', currency: testCurrency.toUpperCase() };
    }
    if (testCountry) {
      const upper = testCountry.toUpperCase();
      const testMap: Record<string, string> = {
        US: 'USD', IN: 'INR', GB: 'GBP', EU: 'EUR', AE: 'AED', SA: 'SAR',
        BD: 'BDT', NP: 'NPR', LK: 'LKR', MY: 'MYR', SG: 'SGD'
      };
      return { country: testCountry, currency: testMap[upper] || 'USD' };
    }

    // For this app (mainly Pakistan market), default to PKR for all dev/localhost/production
    // unless explicitly testing international with ?testCountry=XX
    console.log('[currency] Defaulting to Pakistan (PKR) for this session');
    return DEFAULT_LOCATION;
  } catch (error) {
    console.error('[currency] Detection error, using default PKR:', error);
    return DEFAULT_LOCATION;
  }
}

/**
 * Get exchange rate from USD to target currency.
 * Uses free Frankfurter API (ECB rates).
 */
export async function getUsdToCurrencyRate(targetCurrency: string): Promise<number> {
  if (!targetCurrency || targetCurrency === 'USD') return 1;

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?amount=1&from=USD&to=${targetCurrency}`,
      {
        next: { revalidate: 86400 }, // Cache rates for 24 hours
      }
    );

    if (!res.ok) throw new Error('Rate fetch failed');

    const data = await res.json();
    const rate = data.rates?.[targetCurrency];

    if (typeof rate !== 'number' || rate <= 0) {
      throw new Error(`Invalid rate for ${targetCurrency}`);
    }

    return rate;
  } catch (error) {
    console.error(`[currency] Rate fetch failed for ${targetCurrency}, using 1:`, error);
    return 1;
  }
}

/**
 * Convert USD amount to target currency.
 */
export async function convertUsdToCurrency(amountUSD: number, targetCurrency: string): Promise<number> {
  const rate = await getUsdToCurrencyRate(targetCurrency);
  return Math.round(amountUSD * rate);
}

/**
 * Safe currency formatter. Handles undefined/null values.
 */
export function formatCurrency(amount: number | undefined | null, currency: string, locale = 'en-US'): string {
  const safeAmount = Number(amount) || 0;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  } catch {
    return `${safeAmount.toLocaleString()} ${currency}`;
  }
}

/**
 * Special safe formatting for PKR.
 */
export function formatPKR(amount: number | undefined | null): string {
  const safeAmount = Number(amount) || 0;
  return `Rs. ${safeAmount.toLocaleString('en-PK')}`;
}

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const priceOptions = [
  { label: 'Under 20,000 PKR', value: 'under-20000' },
  { label: '20,000 - 40,000 PKR', value: '20000-40000' },
  { label: '40,000 - 80,000 PKR', value: '40000-80000' },
  { label: 'Above 80,000 PKR', value: 'above-80000' },
];

const brandOptions = [
  'Samsung', 'Apple', 'Xiaomi', 'Infinix', 'Realme', 'Vivo', 'Oppo', 'Tecno', 'Motorola',
];

export default function FilterPanel({ onClose }: { onClose?: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPriceRange = searchParams.get('priceRange') || '';
  const currentBrand = searchParams.get('brand') || '';

  const [selectedPrices, setSelectedPrices] = useState<string[]>(
    currentPriceRange ? currentPriceRange.split(',') : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    currentBrand ? currentBrand.split(',') : []
  );

  // Sync state when URL params change (e.g. from sidebar clicks)
  useEffect(() => {
    setSelectedPrices(currentPriceRange ? currentPriceRange.split(',') : []);
    setSelectedBrands(currentBrand ? currentBrand.split(',') : []);
  }, [currentPriceRange, currentBrand]);

  const togglePrice = (value: string) => {
    setSelectedPrices(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const toggleBrand = (value: string) => {
    setSelectedBrands(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedPrices.length > 0) {
      params.set('priceRange', selectedPrices.join(','));
    } else {
      params.delete('priceRange');
    }

    if (selectedBrands.length > 0) {
      params.set('brand', selectedBrands.join(','));
    } else {
      params.delete('brand');
    }

    // Keep search query and sort if present
    router.push(`/?${params.toString()}`);
    onClose?.();
  };

  const handleClear = () => {
    setSelectedPrices([]);
    setSelectedBrands([]);
    // Go to clean home, keep q and sort if wanted
    const params = new URLSearchParams();
    const q = searchParams.get('q');
    const sort = searchParams.get('sort');
    if (q) params.set('q', q);
    if (sort) params.set('sort', sort);
    router.push(`/?${params.toString()}`);
    onClose?.();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-sm">Advanced Filters (Apply to fetch)</div>
        <button
          onClick={handleClear}
          className="text-xs text-gray-500 hover:text-emerald-600"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price Ranges */}
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
            Price Ranges (multi-select)
          </div>
          <div className="space-y-1 text-sm">
            {priceOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPrices.includes(opt.value)}
                  onChange={() => togglePrice(opt.value)}
                  className="accent-emerald-600"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
            Brands (multi-select)
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
            {brandOptions.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.toLowerCase())}
                  onChange={() => toggleBrand(brand.toLowerCase())}
                  className="accent-emerald-600"
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleApply}
          className="flex-1 md:flex-none px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-sm rounded-xl"
        >
          Clear
        </button>
      </div>

      <div className="text-[10px] text-gray-400 mt-2">
        Select multiple options and click Apply. Results update based on selected filters.
      </div>
    </div>
  );
}

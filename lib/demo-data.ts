import { Phone as PhoneType } from './types';

// Hardcoded demo phones so the UI works even without MongoDB connected
export const SAMPLE_PHONES: PhoneType[] = [
  {
    name: "Samsung Galaxy A35 5G",
    brand: "Samsung",
    slug: "samsung-galaxy-a35-5g",
    price: 82999,
    priceMax: 94999,
    image: "",
    specs: {
      display: { size: "6.6 inches", type: "Super AMOLED", resolution: "1080 x 2340" },
      performance: { processor: "Exynos 1380" },
      camera: { rear: "50 MP + 8 MP + 5 MP", front: "13 MP" },
      battery: { capacity: "5000 mAh" },
      os: "Android 14",
    },
    isFeatured: true,
    inStock: true,
  },
  {
    name: "Infinix Note 40 Pro",
    brand: "Infinix",
    slug: "infinix-note-40-pro",
    price: 57999,
    specs: {
      display: { size: "6.78 inches", type: "AMOLED", resolution: "1080 x 2436" },
      performance: { processor: "MediaTek Helio G99" },
      camera: { rear: "108 MP + 2 MP", front: "32 MP" },
      battery: { capacity: "5000 mAh" },
      os: "Android 14",
    },
    isFeatured: true,
  },
  {
    name: "Xiaomi Redmi Note 13 Pro",
    brand: "Xiaomi",
    slug: "xiaomi-redmi-note-13-pro",
    price: 56999,
    specs: {
      display: { size: "6.67 inches", type: "AMOLED", resolution: "1220 x 2712" },
      performance: { processor: "Snapdragon 7s Gen 2" },
      camera: { rear: "200 MP + 8 MP + 2 MP", front: "16 MP" },
      battery: { capacity: "5000 mAh" },
      os: "Android 13",
    },
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    slug: "samsung-galaxy-s24-ultra",
    price: 449999,
    specs: {
      display: { size: "6.8 inches", type: "Dynamic AMOLED 2X", resolution: "1440 x 3120" },
      performance: { processor: "Snapdragon 8 Gen 3" },
      camera: { rear: "200 MP + 50 MP + 12 MP + 10 MP", front: "12 MP" },
      battery: { capacity: "5000 mAh" },
      os: "Android 14",
    },
    isFeatured: true,
  },
  {
    name: "Apple iPhone 15",
    brand: "Apple",
    slug: "apple-iphone-15",
    price: 249999,
    specs: {
      display: { size: "6.1 inches", type: "Super Retina XDR OLED", resolution: "1179 x 2556" },
      performance: { processor: "Apple A16 Bionic" },
      camera: { rear: "48 MP + 12 MP", front: "12 MP" },
      battery: { capacity: "3349 mAh" },
      os: "iOS 17",
    },
  },
  {
    name: "Realme 12 Pro+ 5G",
    brand: "Realme",
    slug: "realme-12-pro-plus-5g",
    price: 99999,
    specs: {
      display: { size: "6.7 inches", type: "AMOLED", resolution: "1080 x 2412" },
      performance: { processor: "Snapdragon 7s Gen 2" },
      camera: { rear: "200 MP Periscope", front: "32 MP" },
      battery: { capacity: "5000 mAh" },
      os: "Android 14",
    },
  },
  {
    name: "Vivo V30e",
    brand: "Vivo",
    slug: "vivo-v30e",
    price: 74999,
    specs: {
      display: { size: "6.78 inches", type: "AMOLED", resolution: "1080 x 2400" },
      performance: { processor: "Dimensity 7300" },
      camera: { rear: "50 MP + 8 MP", front: "50 MP" },
      battery: { capacity: "5500 mAh" },
      os: "Android 14",
    },
  },
  {
    name: "Infinix Smart 8",
    brand: "Infinix",
    slug: "infinix-smart-8",
    price: 18999,
    specs: {
      display: { size: "6.6 inches", type: "IPS LCD", resolution: "720 x 1612" },
      performance: { processor: "MediaTek Helio G36" },
      camera: { rear: "13 MP", front: "8 MP" },
      battery: { capacity: "5000 mAh" },
      os: "Android 13",
    },
  },
];

// Helper to filter demo phones by price range slug
export function filterSamplesByPriceRange(samples: PhoneType[], rangeSlug: string | null): PhoneType[] {
  if (!rangeSlug || rangeSlug === 'all') return samples;

  return samples.filter((p) => {
    if (rangeSlug === 'under-20000') return p.price < 20000;
    if (rangeSlug === '20000-40000') return p.price >= 20000 && p.price < 40000;
    if (rangeSlug === '40000-80000') return p.price >= 40000 && p.price < 80000;
    if (rangeSlug === 'above-80000') return p.price >= 80000;
    return true;
  });
}

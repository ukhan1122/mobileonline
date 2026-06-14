/**
 * Seed script for WhatMobile clone
 *
 * Usage (local):
 *   1. Make sure .env.local has MONGODB_URI
 *   2. Run: npm run seed
 *
 * Usage (production / against live DB):
 *   MONGODB_URI="your-production-uri" npm run seed
 *
 * The script now uses pricePKR + priceUSD (global pricing fields).
 *
 * How to add your own real phones:
 *   - Add more objects to the samplePhones array below (copy the structure).
 *   - Then run `npm run seed` again.
 *   - The script will update phones with the same slug.
 *
 * For one-off phones without code:
 *   - Use MongoDB Atlas → your cluster → Browse Collections → phones collection → Insert Document.
 *   - Paste JSON matching the structure shown in the seed array.
 */

import 'dotenv/config';
import connectDB from '../lib/mongodb';
import Phone from '../models/Phone';

const samplePhones = [
  {
    name: "Samsung Galaxy A35 5G",
    brand: "Samsung",
    slug: "samsung-galaxy-a35-5g",
    pricePKR: 82999,
    priceUSD: 295,
    releaseDate: "March 2024",
    image: "https://picsum.photos/id/1015/400/400",
    specs: {
      display: { size: "6.6 inches", type: "Super AMOLED", resolution: "1080 x 2340", refreshRate: "120Hz" },
      processor: "Samsung Exynos 1380",
      camera: { rear: "50 MP (OIS) + 8 MP + 5 MP", front: "13 MP" },
      battery: "5000 mAh",
      charging: "25W Fast Charging",
      os: "Android 14, One UI 6.1",
    },
    variants: [
      { storage: "128GB", ram: "8GB", price: 82999 },
      { storage: "256GB", ram: "8GB", price: 94999 },
    ],
    colors: ["Awesome Navy", "Awesome Iceblue", "Awesome Lemon"],
    isFeatured: true,
    popularityScore: 92,
    inStock: true,
  },
  {
    name: "Infinix Note 40 Pro",
    brand: "Infinix",
    slug: "infinix-note-40-pro",
    pricePKR: 57999,
    priceUSD: 205,
    releaseDate: "April 2024",
    image: "https://picsum.photos/id/106/400/400",
    specs: {
      display: { size: "6.78 inches", type: "AMOLED", resolution: "1080 x 2436", refreshRate: "120Hz" },
      processor: "MediaTek Helio G99 Ultimate",
      camera: { rear: "108 MP + 2 MP", front: "32 MP" },
      battery: "5000 mAh",
      charging: "70W Wired + 20W Wireless",
      os: "Android 14, XOS 14.1",
    },
    variants: [
      { storage: "256GB", ram: "8GB", price: 57999 },
    ],
    colors: ["Vintage Green", "Obsidian Black"],
    isFeatured: true,
    popularityScore: 78,
  },
  {
    name: "Xiaomi Redmi Note 13 Pro 4G",
    brand: "Xiaomi",
    slug: "xiaomi-redmi-note-13-pro-4g",
    pricePKR: 56999,
    priceUSD: 200,
    releaseDate: "January 2024",
    image: "https://picsum.photos/id/160/400/400",
    specs: {
      display: { size: "6.67 inches", type: "AMOLED", resolution: "1220 x 2712", refreshRate: "120Hz" },
      processor: "Qualcomm Snapdragon 7s Gen 2",
      camera: { rear: "200 MP + 8 MP + 2 MP", front: "16 MP" },
      battery: "5000 mAh",
      charging: "67W Turbo Charging",
      os: "Android 13, MIUI 14 / HyperOS",
    },
    variants: [
      { storage: "128GB", ram: "8GB", price: 56999 },
      { storage: "256GB", ram: "8GB", price: 62999 },
    ],
    colors: ["Midnight Black", "Lavender Purple"],
    isFeatured: true,
    popularityScore: 85,
  },
  {
    name: "Realme 12 Pro+ 5G",
    brand: "Realme",
    slug: "realme-12-pro-plus-5g",
    pricePKR: 99999,
    priceUSD: 355,
    releaseDate: "February 2024",
    image: "https://picsum.photos/id/201/400/400",
    specs: {
      display: { size: "6.7 inches", type: "AMOLED", resolution: "1080 x 2412", refreshRate: "120Hz" },
      processor: "Qualcomm Snapdragon 7s Gen 2",
      camera: { rear: "200 MP Periscope + 8 MP + 2 MP", front: "32 MP" },
      battery: "5000 mAh",
      charging: "67W SuperVOOC",
      os: "Android 14, Realme UI 5.0",
    },
    variants: [
      { storage: "256GB", ram: "8GB", price: 99999 },
    ],
    colors: ["Submarine Blue", "Navigator Beige"],
    isFeatured: true,
    popularityScore: 73,
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    slug: "samsung-galaxy-s24-ultra",
    pricePKR: 449999,
    priceUSD: 1600,
    releaseDate: "January 2024",
    image: "https://picsum.photos/id/180/400/400",
    specs: {
      display: { size: "6.8 inches", type: "Dynamic AMOLED 2X", resolution: "1440 x 3120", refreshRate: "120Hz" },
      processor: "Qualcomm Snapdragon 8 Gen 3",
      camera: { rear: "200 MP + 50 MP + 12 MP + 10 MP", front: "12 MP" },
      battery: "5000 mAh",
      charging: "45W Super Fast Charging",
      os: "Android 14, One UI 6.1",
    },
    variants: [
      { storage: "256GB", ram: "12GB", price: 449999 },
      { storage: "512GB", ram: "12GB", price: 499999 },
    ],
    colors: ["Titanium Black", "Titanium Gray", "Titanium Violet"],
    isFeatured: true,
    popularityScore: 95,
  },
  {
    name: "Apple iPhone 15",
    brand: "Apple",
    slug: "apple-iphone-15",
    pricePKR: 249999,
    priceUSD: 890,
    releaseDate: "September 2023",
    image: "https://picsum.photos/id/29/400/400",
    specs: {
      display: { size: "6.1 inches", type: "Super Retina XDR OLED", resolution: "1179 x 2556", refreshRate: "60Hz" },
      processor: "Apple A16 Bionic",
      camera: { rear: "48 MP + 12 MP", front: "12 MP" },
      battery: "3349 mAh",
      charging: "20W Fast Charging",
      os: "iOS 17 (upgradable to iOS 18)",
    },
    variants: [
      { storage: "128GB", ram: "6GB", price: 249999 },
      { storage: "256GB", ram: "6GB", price: 279999 },
    ],
    colors: ["Black", "Blue", "Green", "Yellow", "Pink"],
    isFeatured: true,
    popularityScore: 90,
  },
  {
    name: "Vivo V30e",
    brand: "Vivo",
    slug: "vivo-v30e",
    pricePKR: 74999,
    priceUSD: 265,
    releaseDate: "May 2024",
    image: "https://picsum.photos/id/251/400/400",
    specs: {
      display: { size: "6.78 inches", type: "AMOLED", resolution: "1080 x 2400", refreshRate: "120Hz" },
      processor: "MediaTek Dimensity 7300",
      camera: { rear: "50 MP + 8 MP", front: "50 MP" },
      battery: "5500 mAh",
      charging: "44W Fast Charging",
      os: "Android 14, Funtouch OS 14",
    },
    variants: [
      { storage: "128GB", ram: "8GB", price: 74999 },
    ],
    colors: ["Royal Gold", "Velvet Red"],
    popularityScore: 68,
  },
  {
    name: "Tecno Camon 20 Premier",
    brand: "Tecno",
    slug: "tecno-camon-20-premier",
    pricePKR: 64999,
    priceUSD: 230,
    releaseDate: "July 2023",
    image: "https://picsum.photos/id/312/400/400",
    specs: {
      display: { size: "6.67 inches", type: "AMOLED", resolution: "1080 x 2400", refreshRate: "120Hz" },
      processor: "MediaTek Helio G99",
      camera: { rear: "108 MP + 50 MP + 2 MP", front: "32 MP" },
      battery: "5000 mAh",
      charging: "45W Fast Charging",
      os: "Android 13, HiOS 13",
    },
    variants: [
      { storage: "512GB", ram: "8GB", price: 64999 },
    ],
    colors: ["Serenity Blue", "Iceland Silver"],
    popularityScore: 62,
  },
];

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('🧹 Clearing existing sample phones (by slug match)...');
    await Phone.deleteMany({
      slug: { $in: samplePhones.map((p) => p.slug) },
    });

    console.log(`🌱 Seeding ${samplePhones.length} phones...`);
    await Phone.insertMany(samplePhones);

    console.log('✅ Seed complete. You can now browse the website.');
    console.log('\nTry these routes:');
    console.log('  - http://localhost:3000');
    console.log('  - http://localhost:3000/search');
    console.log('  - http://localhost:3000/prices/under-20000');
    console.log('  - http://localhost:3000/phones/samsung-galaxy-a35-5g');
    console.log('  - http://localhost:3000/brands/samsung');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();

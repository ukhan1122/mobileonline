/**
 * EXAMPLE: Using cleanMobileSpecs with MongoDB
 *
 * You can run this with: npx tsx lib/EXAMPLE-cleanSpecs-usage.ts
 * (after having MONGODB_URI in .env.local)
 */

import 'dotenv/config';
import connectDB from './mongodb';
import Phone from '../models/Phone';
import { cleanMobileSpecs } from './specCleaner';

// This is the exact messy format you get from many spec websites / copy-paste
const messyTable = [
  { General: "Release", Features: "Date", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "02", Features: "Jun", FIELD3: "2026", FIELD4: "", FIELD5: "" },
  { General: "SIM", Features: "Support", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Dual", Features: "Sim", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Phone", Features: "Weight", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "219g", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Operating", Features: "System", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Xiaomi", Features: "HyperOS", FIELD3: "3", FIELD4: "", FIELD5: "" },
  { General: "Screen", Features: "Size", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: '6.83"', Features: "144Hz", FIELD3: "eye-care", FIELD4: "AMOLED", FIELD5: "display" },
  { General: "Screen", Features: "Resolution", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "2772", Features: "x", FIELD3: "1280", FIELD4: "", FIELD5: "" },
  { General: "Screen", Features: "Type", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "AMOLED", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Screen", Features: "Protection", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Corning", Features: "Gorilla", FIELD3: "Glass", FIELD4: "7i", FIELD5: "" },
  { General: "Internal", Features: "Memory", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "512GB", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "RAM", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "12GB", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Card", Features: "Slot", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "N/A", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Processor", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "MediaTek", Features: "Dimensity", FIELD3: "9500", FIELD4: "", FIELD5: "" },
  { General: "GPU", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Mali", Features: "G1-Ultra", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Battery", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "7000mAh", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Rear", Features: "Camera", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "50MP", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Front", Features: "Camera", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "32", Features: "MP", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "5G", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Yes", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "WiFi", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Yes", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Bluetooth", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Yes", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "NFC", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Yes", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
];

async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await connectDB();

  console.log('🧹 Converting messy table data...');
  const cleanSpecs = cleanMobileSpecs(messyTable);

  console.log('✅ Clean specs result:');
  console.dir(cleanSpecs, { depth: 3 });

  const phone = new Phone({
    name: 'Xiaomi Example Phone (from table)',
    brand: 'Xiaomi',
    slug: 'xiaomi-example-from-table-' + Date.now(),
    price: 89999,
    specs: cleanSpecs,
    isFeatured: false,
    inStock: true,
  });

  await phone.save();
  console.log('\n✅ Phone saved to MongoDB with _id:', phone._id);
  console.log('You can now view it at /phones/' + phone.slug);
}

main().catch((err) => {
  console.error('Example failed:', err);
  process.exit(1);
});
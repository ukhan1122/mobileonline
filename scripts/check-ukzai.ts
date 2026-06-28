import 'dotenv/config';
import mongoose from 'mongoose';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, family: 4, dbName: 'ukzaiDB' } as any);
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in ukzaiDB:', collections.map(c => c.name));
    const hasPhones = collections.some(c => c.name === 'phones');
    if (!hasPhones) {
      console.log('No phones collection in ukzaiDB');
    } else {
      const count = await db.collection('phones').countDocuments();
      console.log('phones count in ukzaiDB:', count);
      const samples = await db.collection('phones').find({}, { projection: { slug: 1, name: 1 } }).limit(20).toArray();
      console.log('Sample slugs/names from ukzaiDB:');
      samples.forEach((p: any) => console.log('-', p.slug, '|', p.name));
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('Error:', err?.message || err);
    process.exit(1);
  }
}

run();

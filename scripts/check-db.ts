import 'dotenv/config';
import mongoose from 'mongoose';
import Phone from '../models/Phone';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  try {
    console.log('Connecting to', uri.split('@').pop?.() ?? uri);
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, family: 4 } as any);
    const dbName = conn.connection.db.databaseName;
    console.log('Connected DB name:', dbName);

    const count = await Phone.countDocuments();
    console.log('phones count in this DB:', count);

    const samples = await Phone.find({}).limit(20).select('slug name').lean();
    console.log('Sample slugs/names:');
    samples.forEach((p: any) => console.log('-', p.slug, '|', p.name));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('Error:', err?.message || err);
    process.exit(1);
  }
}

run();

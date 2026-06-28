import 'dotenv/config';
import mongoose from 'mongoose';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, family: 4 } as any);
    const admin = conn.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Databases visible to this user:');
    dbs.databases.forEach((d: any) => console.log('-', d.name, `(sizeOnDisk: ${d.sizeOnDisk})`));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('Error listing DBs:', err?.message || err);
    process.exit(1);
  }
}

run();

import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

function isDnsOrConnectionError(err: any): boolean {
  const msg = (err?.message || err?.toString() || '').toLowerCase();
  const code = err?.code || '';
  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    code === 'EAI_AGAIN' ||
    msg.includes('querysrv') ||
    msg.includes('querytxt') ||
    msg.includes('econnrefused') ||
    msg.includes('enotfound') ||
    msg.includes('getaddrinfo') ||
    msg.includes('mongoserverselectionerror') ||
    msg.includes('timed out') ||
    msg.includes('failed to connect')
  );
}

function buildConnectionError(originalError: any): Error {
  const rawMessage = originalError?.message || String(originalError);

  if (isDnsOrConnectionError(originalError)) {
    const hint = [
      'MongoDB Atlas connection failed (DNS/network error).',
      '',
      'This usually means one of:',
      '  • Your Atlas cluster is paused or deleted (free tier clusters pause automatically)',
      '  • Network Access is not allowing your IP (add 0.0.0.0/0 for local dev)',
      '  • The hostname in MONGODB_URI is wrong or the cluster no longer exists',
      '  • Your local DNS/network (firewall, VPN, corporate network) cannot resolve SRV records',
      '  • Password contains special characters and was not URL-encoded',
      '',
      'Quick fixes:',
      '1. Go to https://cloud.mongodb.com → check that the cluster is "Active" (not paused)',
      '2. Network Access → Add IP Address → "Allow Access from Anywhere" (0.0.0.0/0)',
      '3. Connect → Drivers → Node.js → copy a FRESH connection string',
      '4. (Advanced) Try the non-SRV connection string from Atlas (starts with mongodb:// instead of mongodb+srv://)',
      '5. Restart dev server completely after changing .env.local:',
      '     taskkill /F /IM node.exe && npm run dev',
      '',
      `Original error: ${rawMessage}`,
    ].join('\n');

    const friendly = new Error(hint);
    (friendly as any).code = originalError?.code;
    return friendly;
  }

  // Generic case — surface the real error but make it clear it's a DB issue
  return new Error(`MongoDB connection error: ${rawMessage}`);
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local\n\n' +
        'See README-WHATMOBILE.md for MongoDB Atlas setup instructions.'
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // Helps on some Windows/IPv6 DNS setups
      family: 4,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null; // allow retry on next request
    throw buildConnectionError(e);
  }

  return cached.conn;
}

export default connectDB;

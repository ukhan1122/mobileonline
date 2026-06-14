'use client';

import Link from 'next/link';

export default function DatabaseSetupNotice() {
  return (
    <div className="max-w-2xl mx-auto mt-12 px-6">
      <div className="bg-white border border-amber-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            ⚠️
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Database not connected</h2>
            <p className="text-amber-700 text-sm">MongoDB Atlas setup required</p>
          </div>
        </div>

        <div className="prose prose-sm text-gray-600 mb-6">
          <p>
            This page needs a connection to MongoDB. The homepage works without it, but price lists, 
            search, brands, and phone details require the database.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-sm font-mono">
          <div className="text-gray-500 mb-1 text-xs">1. Edit .env.local (file already created for you)</div>
          <div>MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@your-real-cluster.mongodb.net/mobileprices...</div>
        </div>

        <div className="mb-4 text-sm text-amber-700">
          <strong>Common error:</strong> <code>querySrv ECONNREFUSED _mongodb._tcp.cluster0....</code> (even with a real-looking cluster name) means the app cannot reach your Atlas cluster.
          This happens when the cluster is paused, deleted, IP is not whitelisted, or your local network has DNS/SRV issues.
        </div>

        <ol className="list-decimal list-inside text-sm space-y-2 text-gray-700 mb-6">
          <li>
            Go to{' '}
            <a href="https://cloud.mongodb.com" target="_blank" className="text-emerald-700 underline">
              MongoDB Atlas
            </a>{' '}
            and <strong>check your cluster status</strong> (free M0 clusters often show as paused).
          </li>
          <li>If paused → click "Resume" (can take 1-2 minutes).</li>
          <li>Network Access → ensure your current IP (or <code>0.0.0.0/0</code>) is allowed.</li>
          <li>Database Access → confirm your database user still exists with the right password.</li>
          <li>Atlas → Connect → Drivers (Node.js) → copy a fresh connection string and replace the entire <code>MONGODB_URI=...</code> line in <code>.env.local</code>.</li>
          <li><strong>Fully restart</strong> the dev server after editing .env.local:<br />
            <code className="bg-gray-100 px-1.5 py-0.5 rounded">taskkill /F /IM node.exe &amp;&amp; npm run dev</code>
          </li>
          <li>
            Then run <code className="bg-gray-100 px-1.5 py-0.5 rounded">npm run seed</code> to load sample phones.
          </li>
        </ol>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-medium"
          >
            ← Back to Homepage
          </Link>
          <a
            href="https://github.com/mongodb-university/Atlas-CLI-Quickstart"
            target="_blank"
            className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
          >
            MongoDB Atlas Setup Guide →
          </a>
        </div>

        <div className="mt-5 text-[11px] text-gray-400">
          Full instructions are in <span className="font-medium">README-WHATMOBILE.md</span>
        </div>
      </div>
    </div>
  );
}

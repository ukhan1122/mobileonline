'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cleanMobileSpecs, extractReleaseDate } from '@/lib/specCleaner';

export default function AddPhonePage() {
  // Only available in development mode.
  // In production builds, this page is always restricted.
  const isDevelopment = process.env.NODE_ENV === 'development';

  const [form, setForm] = useState({
    name: '',
    pricePKR: '',
    priceUSD: '',
    image: '',
    specs: `[
  { "General": "Release Date", "Features": "23 Jan 2025" },
  { "General": "SIM Support", "Features": "Dual Sim" },
  { "General": "Phone Dimensions", "Features": "146.9 x 70.5 x 7.2 mm" },
  { "General": "Phone Weight", "Features": "162 g" },
  { "General": "Operating System", "Features": "Android 14" },
  { "General": "Display", "Features": "" },
  { "General": "Screen Size", "Features": "6.2 Inches" },
  { "General": "Screen Resolution", "Features": "2340 x 1080 Pixels" },
  { "General": "Screen Type", "Features": "Dynamic AMOLED 2X, 120Hz Refresh Rate" },
  { "General": "Screen Protection", "Features": "N/A" },
  { "General": "Memory", "Features": "" },
  { "General": "Internal Memory", "Features": "512 GB" },
  { "General": "RAM", "Features": "12 GB" },
  { "General": "Card Slot", "Features": "No" },
  { "General": "Performance", "Features": "" },
  { "General": "Processor", "Features": "Snapdragon 8 Elite" },
  { "General": "GPU", "Features": "N/A" },
  { "General": "Battery", "Features": "" },
  { "General": "Type", "Features": "4000 mAh" },
  { "General": "Camera", "Features": "" },
  { "General": "Front Camera", "Features": "12 MP" },
  { "General": "Front Flash Light", "Features": "Yes" },
  { "General": "Front Video Recording", "Features": "Yes" },
  { "General": "Back Flash Light", "Features": "Yes" },
  { "General": "Back Camera", "Features": "50MP + 10MP + 12MP" },
  { "General": "Back Video Recording", "Features": "UHD 8K (7680 x 4320) @30fps" },
  { "General": "Connectivity", "Features": "" },
  { "General": "Bluetooth", "Features": "Yes" },
  { "General": "3G", "Features": "Yes" },
  { "General": "4G/LTE", "Features": "Yes" },
  { "General": "5G", "Features": "Yes" },
  { "General": "Radio", "Features": "N/A" },
  { "General": "WiFi", "Features": "Yes" },
  { "General": "NFC", "Features": "Yes" }
]`,
    isFeatured: false,
    inStock: true,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [specsError, setSpecsError] = useState('');
  const [specsAutoConverted, setSpecsAutoConverted] = useState(false);

  // Cloudinary image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Early return if not in development
  if (!isDevelopment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link href="/" className="text-sm text-emerald-600 hover:underline">← Back to homepage</Link>
        </div>
        <div className="bg-white border rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-semibold mb-3">Restricted Area</h1>
          <p className="text-gray-600 mb-4">
            The Add Phone form is only available when running the site locally in development mode.
          </p>
          <p className="text-sm text-gray-500">
            In production (when the site is deployed), this functionality is completely disabled.
          </p>
        </div>
      </div>
    );
  }

  // New: Parse specs input - supports BOTH valid JSON (object/array) 
  // AND raw table text pasted from websites (e.g. "General Features\nRelease Date\n23 Jan 2025\n...")
  function parseSpecsInput(input: string) {
    const trimmed = (input || '').trim();
    if (!trimmed) return {};

    // 1. Try as JSON first
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      // 2. Treat as raw table text (very common when copying from priceoye / whatmobile etc.)
      let lines = trimmed
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

      // Helper: skip bare category/section headers (Display, Memory, Performance, Camera, etc.)
      // so that "Display\nScreen Size\n6.1 inches\n..." pastes correctly without mangling pairs.
      function isSectionHeader(text: string): boolean {
        const t = text.toLowerCase().trim();
        if (!t) return false;
        // Only exact bare category headers. Do NOT match "Screen Size", "Screen Resolution" etc.
        const bare = [
          'general features', 'general', 'display', 'memory', 'performance',
          'battery', 'camera', 'connectivity', 'sound', 'body', 'misc', 'features', 'other'
        ];
        if (bare.includes(t)) return true;
        if (t === 'screen') return true; // lone "Screen" category if ever present
        return false;
      }

      const rows: any[] = [];
      let i = 0;
      // Skip common title/header lines like "General Features"
      if (lines.length > 0 && /general features/i.test(lines[0])) {
        i = 1;
      }

      while (i < lines.length) {
        let label = lines[i] || '';
        if (isSectionHeader(label)) {
          i++;
          continue;
        }
        const value = lines[i + 1] || '';
        if (label) {
          rows.push({
            General: label,
            Features: isSectionHeader(value) ? '' : value
          });
          i += 2;
        } else {
          i++;
        }
      }
      return rows;
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }

    // Live validation for specs (supports JSON or raw table text paste)
    if (name === 'specs') {
      try {
        const parsed = parseSpecsInput(value);
        if (parsed === null || typeof parsed !== 'object') {
          setSpecsError('Paste valid JSON or raw table text (General/Features lines from your source)');
          setSpecsAutoConverted(false);
        } else if (Array.isArray(parsed)) {
          setSpecsError('');
          setSpecsAutoConverted(true);
        } else {
          setSpecsError('');
          setSpecsAutoConverted(false);
        }
      } catch (e: any) {
        setSpecsError(e.message);
        setSpecsAutoConverted(false);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Clear manual URL when file is selected
      setForm(prev => ({ ...prev, image: '' }));
    }
  };

  const loadExample = () => {
    // Clear any previous image file/preview
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview('');

    setForm({
      name: 'Google Pixel 9 Pro',
      pricePKR: '119999',
      priceUSD: '430',
      image: 'https://picsum.photos/id/1018/400/400',
      specs: `[
  { "General": "Release Date", "Features": "August 2024" },
  { "General": "SIM Support", "Features": "Dual Sim" },
  { "General": "Phone Dimensions", "Features": "146.9 x 70.5 x 7.2 mm" },
  { "General": "Phone Weight", "Features": "199 g" },
  { "General": "Operating System", "Features": "Android 14 (upgradable to Android 15)" },
  { "General": "Display", "Features": "" },
  { "General": "Screen Size", "Features": "6.3 Inches" },
  { "General": "Screen Resolution", "Features": "1080 x 2424 Pixels" },
  { "General": "Screen Type", "Features": "LTPO OLED, 120Hz Refresh Rate" },
  { "General": "Memory", "Features": "" },
  { "General": "Internal Memory", "Features": "256 GB" },
  { "General": "RAM", "Features": "16 GB" },
  { "General": "Card Slot", "Features": "No" },
  { "General": "Performance", "Features": "" },
  { "General": "Processor", "Features": "Google Tensor G4" },
  { "General": "GPU", "Features": "Adreno" },
  { "General": "Battery", "Features": "" },
  { "General": "Type", "Features": "4700 mAh" },
  { "General": "Camera", "Features": "" },
  { "General": "Front Camera", "Features": "42 MP" },
  { "General": "Back Camera", "Features": "50 MP + 48 MP + 48 MP" },
  { "General": "Connectivity", "Features": "" },
  { "General": "5G", "Features": "Yes" },
  { "General": "WiFi", "Features": "Yes" },
  { "General": "Bluetooth", "Features": "Yes" },
  { "General": "NFC", "Features": "Yes" }
]`,
      isFeatured: true,
      inStock: true,
    });
    setResult(null);
    setError('');
    setSpecsError('');
  };

  // Auto-generate URL-friendly slug from phone name (e.g. "Samsung Galaxy S25" -> "samsung-galaxy-s25")
  function generateSlug(name: string): string {
    return (name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 1. Handle image upload to Cloudinary if a file was selected
      let finalImageUrl = form.image.trim() || undefined;

      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload image to Cloudinary');
        }

        finalImageUrl = uploadData.url;
      }

      // 2. Parse specs (raw table text or JSON array is supported)
      const rawParsed = parseSpecsInput(form.specs);

      let specs: any = rawParsed;
      let autoReleaseDate = '';

      // AUTO-CONVERT: if user pasted raw table text or array format, 
      // convert to clean nested specs. Also auto-extract Release Date.
      if (Array.isArray(rawParsed)) {
        autoReleaseDate = extractReleaseDate(rawParsed) || '';
        specs = cleanMobileSpecs(rawParsed);
      }

      if (specs === null || typeof specs !== 'object') {
        throw new Error('Could not parse Specs. Paste either valid JSON or the raw table lines from your source.');
      }

      // Strip releaseDate from specs (we want it at phone top level only)
      if (specs.releaseDate) {
        if (!autoReleaseDate) autoReleaseDate = specs.releaseDate;
        delete specs.releaseDate;
      }

      const phoneName = form.name.trim();
      const autoBrand = phoneName.split(/\s+/)[0] || '';

      const phoneData = {
        name: phoneName,
        brand: autoBrand,
        slug: generateSlug(phoneName),
        pricePKR: parseInt(form.pricePKR, 10),
        priceUSD: parseInt(form.priceUSD, 10),
        image: finalImageUrl,
        releaseDate: autoReleaseDate || undefined,
        specs,
        isFeatured: form.isFeatured,
        inStock: form.inStock,
      };

      // 3. Create the phone in MongoDB
      const res = await fetch('/api/phones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phoneData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add phone');
      }

      setResult(data.phone);

      // Reset form and image state (specs template is kept for convenience)
      setForm(prev => ({ 
        ...prev, 
        name: '', 
        pricePKR: '',
        priceUSD: '',
        image: '',
      }));
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview('');
      setSpecsError('');
      setSpecsAutoConverted(false);

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Check the specs field.');
      setSpecsAutoConverted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/" className="text-sm text-emerald-600 hover:underline">← Back to homepage</Link>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">Add New Phone</h1>
        <p className="text-gray-600 mt-1">
          Fill the form below and submit. The phone will be saved to your MongoDB Atlas and appear immediately on the site.
          <strong>You can paste the raw table array (General/Features/FIELDx rows) directly into Specs — it auto-converts.</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border rounded-2xl p-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Name</label>
            <input name="name" value={form.name ?? ''} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2" placeholder="Tecno Spark 10" />
            {form.name && (
              <div className="text-[10px] text-gray-500 mt-0.5 font-mono">
                Slug: {generateSlug(form.name)}
              </div>
            )}
            <div className="text-[10px] text-emerald-600 mt-0.5">
              Brand will be automatically taken from the first word of the name (e.g. "Tecno Spark 10" → Tecno)
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pakistan Price (PKR)</label>
            <input name="pricePKR" type="number" value={form.pricePKR ?? ''} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2" placeholder="189999" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">International Price (USD)</label>
            <input name="priceUSD" type="number" value={form.priceUSD ?? ''} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2" placeholder="650" />
            <div className="text-[10px] text-amber-600 mt-0.5">
              Tip: Set this a little higher than the PKR price (for international buyers).
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Phone Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            {imagePreview && (
              <div className="mt-3">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-40 rounded-lg border object-contain bg-gray-50" 
                />
              </div>
            )}
            {/* Fallback manual URL */}
            <input 
              name="image" 
              value={form.image ?? ''} 
              onChange={handleChange} 
              className="w-full border rounded-lg px-3 py-2 mt-2 text-sm" 
              placeholder="Or paste direct image URL (optional fallback)" 
            />
          </div>
        </div>

        {/* Specs as JSON for simplicity & flexibility */}
        <div>
          <label className="block text-sm font-medium mb-1">Specs (JSON)</label>
          <textarea 
            name="specs" 
            value={form.specs ?? ''} 
            onChange={handleChange} 
            rows={8} 
            className={`w-full font-mono text-sm border rounded-lg px-3 py-2 ${specsError ? 'border-red-500' : ''}`} 
            required 
          />
          {specsError ? (
            <p className="text-xs text-red-600 mt-1">{specsError}</p>
          ) : specsAutoConverted ? (
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              ✓ Raw table text (or array) detected — will be automatically converted to clean specs on submit.
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              <strong>Paste raw copied table text directly</strong> (e.g. lines starting with "General Features", "Release Date", "23 Jan 2025", "Display", "Screen Size" etc. from websites).<br />
              Category headers like "Display", "Memory", "Performance", "Camera", "Connectivity" are automatically skipped.<br />
              The form will auto-detect the table format, convert it, and <strong>automatically extract Release Date</strong> to the phone's top-level field.<br />
              You can also paste clean JSON object or array.
            </p>
          )}
        </div>



        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
            <span className="text-sm">Featured (show in "Best Phones")</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleChange} />
            <span className="text-sm">In Stock</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium rounded-xl"
          >
            {loading ? 'Uploading...' : 'Upload Phone to Database'}
          </button>

          <button 
            type="button" 
            onClick={loadExample}
            className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-xl text-sm"
          >
            Load Example
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Phone added successfully!</p>
            <p className="text-sm mt-1">
              View it here: <Link href={`/phones/${result.slug}`} className="underline font-medium">{result.name}</Link>
            </p>
            <p className="text-xs mt-2 text-green-600">Refresh the homepage to see it in the grid and filters.</p>
          </div>
        )}
      </form>

      <div className="mt-8 text-xs text-gray-500">
        Tip: After uploading, go to the homepage. Your new phone will appear in the results and can be filtered using the popup "Filters" button or the left sidebar.
      </div>
    </div>
  );
}

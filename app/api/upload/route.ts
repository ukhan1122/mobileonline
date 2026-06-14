import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

// POST /api/upload
// Accepts multipart/form-data with 'file' field
export async function POST(request: NextRequest) {
  try {
    // Always configure explicitly from current process.env on every upload.
    // This protects against .env changes while a server was already running.
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    if (cloudinaryUrl) {
      cloudinary.config(cloudinaryUrl);
    } else if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    } else {
      console.error('Cloudinary environment variables at upload time:', {
        CLOUDINARY_CLOUD_NAME: cloudName ? '(set)' : '(MISSING)',
        CLOUDINARY_API_KEY: apiKey ? '(set)' : '(MISSING)',
        CLOUDINARY_API_SECRET: apiSecret ? '(set)' : '(MISSING)',
        CLOUDINARY_URL: cloudinaryUrl ? '(set)' : '(MISSING)',
      });
      throw new Error(
        'Cloudinary credentials are missing.\n' +
        'You must have either:\n' +
        '  CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET\n' +
        'or\n' +
        '  CLOUDINARY_URL\n\n' +
        'in your .env.local file.\n\n' +
        'IMPORTANT: After editing .env.local you MUST fully restart the dev server.\n' +
        'Run these two commands:\n' +
        '  taskkill /F /IM node.exe\n' +
        '  npm run dev'
      );
    }

    // Safety check after config
    const currentConfig = cloudinary.config();
    if (!currentConfig.api_key) {
      throw new Error('Cloudinary still has no api_key after config. Check your .env.local names and restart the dev server with taskkill + npm run dev.');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'mobile-phones',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

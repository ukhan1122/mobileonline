import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Phone from '@/models/Phone';
import { cleanMobileSpecs, extractReleaseDate } from '@/lib/specCleaner';

export const dynamic = 'force-dynamic';

// GET /api/phones
// Supports query params:
//   q= (search text)
//   brand=
//   minPrice= maxPrice=
//   sort=price-low | price-high | newest | popular
//   limit=
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q') || '';
    const brand = searchParams.get('brand') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'popular';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 48;

    // Build MongoDB filter
    const filter: any = {};

    if (q) {
      // Use text index if possible + regex fallback
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
      ];
    }

    if (brand) {
      filter.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }

    if (minPrice) {
      filter.price = { ...filter.price, $gte: parseInt(minPrice, 10) };
    }
    if (maxPrice) {
      filter.price = { ...filter.price, $lte: parseInt(maxPrice, 10) };
    }

    // Sorting
    let sortOption: any = { popularityScore: -1, price: 1 };

    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { popularityScore: -1, price: 1 };

    const phones = await Phone.find(filter)
      .sort(sortOption)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: phones.length,
      phones,
    });
  } catch (error: any) {
    console.error('GET /api/phones error:', error);
    const msg = error?.message || '';
    const isDbSetupError =
      !process.env.MONGODB_URI ||
      /MONGODB_URI/i.test(msg) ||
      /ECONNREFUSED|querySrv|ENOTFOUND|server selection/i.test(msg);

    return NextResponse.json(
      {
        success: false,
        error: isDbSetupError
          ? 'Database connection failed. Check MONGODB_URI in .env.local and your MongoDB Atlas cluster status.'
          : 'Failed to fetch phones',
      },
      { status: 500 }
    );
  }
}

// POST /api/phones
// Body: full phone document (matches the Phone schema)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    let body = await request.json();

    // Basic required field checks
    if (!body.name || !body.slug || typeof body.pricePKR !== 'number' || typeof body.priceUSD !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, slug, pricePKR, priceUSD (numbers)' },
        { status: 400 }
      );
    }

    if (!body.brand && body.name) {
      body.brand = String(body.name).trim().split(/\s+/)[0] || '';
    }

    if (!body.brand) {
      return NextResponse.json(
        { success: false, error: 'Could not determine brand (first word of name)' },
        { status: 400 }
      );
    }

    // AUTO-CONVERT raw table array + auto-extract Release Date to top-level
    if (Array.isArray(body.specs)) {
      let extractedRel = extractReleaseDate(body.specs) || '';

      body.specs = cleanMobileSpecs(body.specs);

      if (body.specs.releaseDate) {
        extractedRel = extractedRel || body.specs.releaseDate;
        delete body.specs.releaseDate;
      }

      if (extractedRel && !body.releaseDate) {
        body.releaseDate = extractedRel;
      }
    } else if (body.specs?.releaseDate) {
      // If specs is already object but contains releaseDate
      if (!body.releaseDate) body.releaseDate = body.specs.releaseDate;
      delete body.specs.releaseDate;
    }

    // Early structural validation for specs
    if (body.specs == null || typeof body.specs !== 'object' || Array.isArray(body.specs)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid "specs" value. It must be a JSON object. ' +
            'You can paste the raw table array (General/Features rows) — it will be auto-converted.',
        },
        { status: 400 }
      );
    }

    // Create and save
    const phone = new Phone(body);
    await phone.save();

    return NextResponse.json({
      success: true,
      message: 'Phone added successfully',
      phone: phone.toObject(),
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/phones error:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A phone with this slug already exists. Slug must be unique.' },
        { status: 409 }
      );
    }

    // Mongoose schema validation errors (e.g. wrong specs shape)
    if (error.name === 'ValidationError' || error._message?.includes('validation failed')) {
      const details = error.errors
        ? Object.values(error.errors).map((e: any) => `${e.path}: ${e.message}`).join(' | ')
        : error.message;
      return NextResponse.json(
        {
          success: false,
          error:
            `Validation failed: ${details}. ` +
            `Use the clean nested specs structure (see lib/specCleaner.ts). ` +
            `Recommended fields: display, memory, performance, battery, camera, connectivity.`,
        },
        { status: 400 }
      );
    }

    // Give a clean message for common DB setup / connectivity problems
    const msg = error.message || 'Failed to add phone';
    const isDbSetupError =
      !process.env.MONGODB_URI ||
      /MONGODB_URI/i.test(msg) ||
      /ECONNREFUSED|querySrv|ENOTFOUND|server selection/i.test(msg);

    const publicError = isDbSetupError
      ? 'Database connection failed. Check MONGODB_URI in .env.local and make sure your MongoDB Atlas cluster is running and allows your IP.'
      : msg;

    return NextResponse.json(
      { success: false, error: publicError },
      { status: 500 }
    );
  }
}

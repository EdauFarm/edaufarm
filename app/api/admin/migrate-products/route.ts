import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { scrapeProducts, sanitizeProducts } from '@/lib/productScraper';

export async function POST(req: NextRequest) {
  try {
    // Parse body once
    const body = await req.json();
    const { count = 100, secret } = body;
    
    // Check authentication (bypass in development with secret key)
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasDevSecret = secret === process.env.NEXTAUTH_SECRET;
    
    const session = await getServerSession(authOptions);
    
    if (!session && !(isDevelopment && hasDevSecret)) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in or provide dev secret' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check
    // if (session?.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Forbidden - Admin access required' },
    //     { status: 403 }
    //   );
    // }


    // Scrape products
    const scrapedProducts = await scrapeProducts(count);

    // Sanitize to match schema
    const sanitizedProducts = sanitizeProducts(scrapedProducts);

    // Connect to database
    await dbConnect();

    // Bulk insert products
    const result = await Product.insertMany(sanitizedProducts, {
      ordered: false, // Continue on error
    });


    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${result.length} products`,
      count: result.length,
      products: result.slice(0, 5), // Return first 5 as sample
    });

  } catch (error: any) {
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json({
        success: true,
        message: 'Products migrated (some duplicates skipped)',
        insertedCount: error.result?.nInserted || 0,
      });
    }

    return NextResponse.json(
      { 
        error: 'Failed to migrate products',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const count = await Product.countDocuments();
    const sampleProducts = await Product.find().limit(10).lean();

    return NextResponse.json({
      totalProducts: count,
      sampleProducts,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

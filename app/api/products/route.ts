import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';

// Enable caching with revalidation
export const revalidate = 10; // Revalidate every 10 seconds for faster price updates

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a paginated list of products with optional filters
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of products per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, and tags
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, price, title]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: featured
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter featured products
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Connect to database with timeout
    await Promise.race([
      dbConnect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ]);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search') || searchParams.get('q'); // Support both 'search' and 'q'
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort'); // rating, price, newest
    const all = searchParams.get('all') === '1';


    const skip = (page - 1) * limit;


    // Build query
    const query: any = {};
    // If ?all=1, do not filter by active status
    if (!all) {
      // Show only active products
      query.$or = [
        { active: true },
        { active: { $exists: false } }
      ];
    }

    if (category && category !== 'null' && category !== 'undefined') {
      // Case-insensitive category matching
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search && search.trim()) {
      const searchTerms = search.trim().split(/\s+/).filter(term => term.length > 0);
      
      // Create regex patterns for each search term
      const searchPatterns = searchTerms.map(term => ({
        $or: [
          { title: { $regex: term, $options: 'i' } },
          { title_fr: { $regex: term, $options: 'i' } },
          { title_ar: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } },
          { description_fr: { $regex: term, $options: 'i' } },
          { description_ar: { $regex: term, $options: 'i' } },
          { category: { $regex: term, $options: 'i' } },
          { tags: { $regex: term, $options: 'i' } },
        ]
      }));
      
      // Combine all search patterns with AND logic (all terms must match)
      if (query.$or) {
        // If we already have an $or (from active status), we need to restructure
        const existingOr = query.$or;
        delete query.$or;
        query.$and = [
          { $or: existingOr },
          ...searchPatterns
        ];
      } else {
        query.$and = searchPatterns;
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (featured === 'true') {
      query.featured = true;
    }

    // Determine sort criteria
    let sortCriteria: any = {};
    if (sort === 'rating') {
      sortCriteria = { 'rating.average': -1 };
    } else if (sort === 'price-low') {
      sortCriteria = { price: 1 };
    } else if (sort === 'price-high') {
      sortCriteria = { price: -1 };
    } else if (sortBy) {
      sortCriteria = { [sortBy]: order };
    } else {
      sortCriteria = { createdAt: -1 };
    }


    // Ensure User model is registered for populate to work
    User; // This forces the model to be loaded

    // Execute query with optimized projection and error handling
    const projection = {
      title: 1,
      price: 1,
      compareAtPrice: 1,
      images: 1,
      category: 1,
      subcategory: 1,
      brand: 1,
      stock: 1,
      rating: 1,
      featured: 1,
      active: 1,
      tags: 1,
      buybackEnabled: 1,
      createdAt: 1,
    };

    const products = await Product.find(query, projection)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean()
      .catch(err => {
        return []; // Return empty array on query error
      });

    const total = await Product.countDocuments(query).catch(() => 0);
    
    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      products: products || [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    
    // Return a proper error response instead of crashing
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch products', 
        message: error.message || 'Unknown error',
        products: [], // Always return an empty array
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          pages: 1,
        }
      },
      { status: 200 } // Use 200 to prevent client-side errors
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    const { title, description, price, category, sku, stock } = body;

    if (!title || !description || !price || !category || !sku || stock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create product
    const product = await Product.create(body);

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create product', message: error.message },
      { status: 500 }
    );
  }
}

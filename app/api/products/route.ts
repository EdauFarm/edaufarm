import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 10;

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search') || searchParams.get('q');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const order = searchParams.get('order') === 'asc' ? false : true;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*, categories(id, name, slug)', { count: 'exact' })
      .eq('is_in_stock', true);

    if (category && category !== 'null' && category !== 'undefined') {
      query = query.eq('categories.slug', category);
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    let sortColumn = 'created_at';
    let ascending = false;

    if (sort === 'rating') {
      sortColumn = 'rating_avg';
      ascending = false;
    } else if (sort === 'price-low') {
      sortColumn = 'price';
      ascending = true;
    } else if (sort === 'price-high') {
      sortColumn = 'price';
      ascending = false;
    } else {
      sortColumn = sortBy === 'createdAt' ? 'created_at' : sortBy;
      ascending = !order;
    }

    query = query.order(sortColumn, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({
        success: true,
        products: [],
        pagination: { page, limit, total: 0, pages: 1 },
      });
    }

    const mappedProducts = (products || []).map((p) => ({
      id: p.id,
      name: p.name,
      title: p.name,
      description: p.description,
      price: p.price,
      compare_at_price: p.compare_at_price,
      images: p.images || [],
      category_id: p.category_id,
      unit_type: p.unit_type,
      is_organic: p.is_organic,
      rating_avg: p.rating_avg,
      rating_count: p.rating_count,
      quantity: p.quantity,
      categories: p.categories,
      is_in_stock: p.is_in_stock,
      is_featured: p.is_featured,
      created_at: p.created_at,
    }));

    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      products: mappedProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit) || 1,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error: any) {
    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message || 'Unknown error',
      products: [],
      pagination: { page: 1, limit: 12, total: 0, pages: 1 },
    }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, description, price, category_id, quantity, images, unit_type, seller_id } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: name and price are required' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        description: description || null,
        price,
        category_id: category_id || null,
        quantity: quantity || 0,
        images: images || [],
        unit_type: unit_type || 'piece',
        seller_id: seller_id || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create product', message: error.message },
        { status: 500 }
      );
    }

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

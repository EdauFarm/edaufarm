import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const [
      { count: totalProducts },
      { count: totalUsers },
      { count: totalOrders },
      { count: pendingOrders },
      { count: lowStockProducts },
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending', 'processing']),
      supabase.from('products').select('*', { count: 'exact', head: true }).lte('quantity', 5),
    ]);

    const { data: orders } = await supabase
      .from('orders')
      .select('total, created_at');

    const totalRevenue = (orders || []).reduce((sum: number, o: { total: number }) => sum + (o.total || 0), 0);

    const monthlyRevenue: number[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthOrders = (orders || []).filter((o: { created_at: string }) => {
        const orderDate = new Date(o.created_at);
        return orderDate >= monthStart && orderDate < monthEnd;
      });

      const monthTotal = monthOrders.reduce((sum: number, o: { total: number }) => sum + (o.total || 0), 0);
      monthlyRevenue.push(Math.round(monthTotal * 100) / 100);
    }

    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, order_number, total, status, created_at, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: topProducts } = await supabase
      .from('products')
      .select('id, name, price, rating_count')
      .order('rating_count', { ascending: false })
      .limit(10);

    return NextResponse.json({
      totalProducts: totalProducts || 0,
      totalUsers: totalUsers || 0,
      totalOrders: totalOrders || 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      pendingOrders: pendingOrders || 0,
      lowStockProducts: lowStockProducts || 0,
      recentOrders: (recentOrders || []).map((o: { id: string; order_number: string; total: number; status: string; created_at: string; profiles: { full_name: string } | { full_name: string }[] | null }) => ({
        _id: o.id,
        order_number: o.order_number,
        customerName: (Array.isArray(o.profiles) ? o.profiles[0]?.full_name : o.profiles?.full_name) || 'Unknown',
        total: o.total || 0,
        status: o.status || 'pending',
        createdAt: o.created_at,
      })),
      recentUsers: (recentUsers || []).map(u => ({
        _id: u.id,
        name: u.full_name,
        email: u.email,
        createdAt: u.created_at,
      })),
      monthlyRevenue,
      topProducts: (topProducts || []).map(p => ({
        _id: p.id,
        title: p.name,
        price: p.price,
        sales: p.rating_count || 0,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch stats', message: error.message },
      { status: 500 }
    );
  }
}

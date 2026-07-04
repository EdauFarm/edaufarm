import { NextRequest, NextResponse } from 'next/server';
import { convertCurrencySync } from '@/lib/currency';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const amount = parseFloat(searchParams.get('amount') || '0');
  const from = searchParams.get('from') || 'KES';
  const to = searchParams.get('to') || 'USD';

  if (isNaN(amount) || !from || !to) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  // Use static rates for backend conversion
  const converted = convertCurrencySync(amount, from, to);
  return NextResponse.json({
    amount,
    from,
    to,
    converted,
    // Optionally return static rate for 'to' currency
    // You can import STATIC_RATES if needed
  });
}

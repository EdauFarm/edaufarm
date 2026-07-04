import { NextRequest, NextResponse } from 'next/server';
import LipiaPaymentService from '@/lib/lipia';

export const dynamic = 'force-dynamic';

/**
 * TEST ENDPOINT - Remove in production
 * Test Lipia STK Push without authentication
 */
export async function POST(request: NextRequest) {
  try {
    const { phone_number, amount } = await request.json();

    if (!phone_number || !amount) {
      return NextResponse.json(
        { error: 'phone_number and amount are required' },
        { status: 400 }
      );
    }

    const formattedPhone = LipiaPaymentService.formatPhoneNumber(phone_number);
    
    if (!LipiaPaymentService.isValidKenyanPhone(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid Kenyan Safaricom phone number' },
        { status: 400 }
      );
    }

    const lipiaService = new LipiaPaymentService();

    const result = await lipiaService.initiateSTKPush({
      phone_number: formattedPhone,
      amount: amount,
      external_reference: `TEST_${Date.now()}`,
      metadata: {
        test: 'test_endpoint',
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'STK push sent successfully',
      data: result.data,
      formatted_phone: formattedPhone,
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message || 'Failed to initiate payment',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

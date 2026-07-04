import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { sendOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';
import { generateOrderReceipt } from '@/lib/receipt';
import { updateOrderProductsVisibility } from '@/lib/productVisibility';

export const dynamic = 'force-dynamic';

// POST: Handle STK Push callback from Lipia
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();


    const { response, status, metadata, data } = body;

    // Extract metadata from the correct location per Lipia docs
    const orderMetadata = response?.Metadata || metadata || data?.metadata || data?.response?.Metadata || {};
    const orderId = orderMetadata.order_id;

    // Also check external reference as fallback
    const externalRef = response?.ExternalReference || data?.response?.ExternalReference || data?.ExternalReference;
    if (!orderId && externalRef && externalRef.startsWith('ORDER_')) {
      const extractedId = externalRef.replace('ORDER_', '');
    }

    if (!orderId) {
      return NextResponse.json({ received: true, message: 'Missing order_id' });
    }


    await dbConnect();

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ received: true, message: 'Order not found' });
    }


    // Check if already processed
    if (order.paymentStatus === 'completed') {
      return NextResponse.json({ received: true, message: 'Already processed' });
    }

    // Check for success - per Lipia documentation
    // Success when: status === true OR response.Status === "Success" OR ResultCode === 0
    const isSuccess = 
      status === true || 
      response?.Status === 'Success' || 
      response?.ResultCode === 0 ||
      data?.response?.Status === 'SUCCESS' ||
      data?.response?.ResultCode === 0 ||
      data?.status === 'SUCCESS';

    if (isSuccess) {
      // Payment successful
      
      order.paymentStatus = 'completed';
      order.status = 'confirmed';
      // Extract from correct locations per Lipia docs
      order.mpesaCode = response?.MpesaReceiptNumber || data?.response?.MpesaReceiptNumber || data?.MpesaReceiptNumber || 'N/A';
      order.mpesaPhone = response?.Phone || data?.response?.Phone || data?.Phone || order.mpesaPhone;
      order.paidAt = new Date();
      order.mpesaVerified = true;

      await order.save();


      // Auto-update product visibility after payment confirmation
      await updateOrderProductsVisibility(orderId);

      // Send confirmation emails
      try {
        // Get user details for receipt
        const user = await User.findById(metadata.user_id);
        const receiptBuffer = user ? await generateOrderReceipt(order, user) : Buffer.from('');
        
        await sendOrderConfirmation(
          metadata.user_email,
          order.shippingAddress.fullName,
          order,
          receiptBuffer
        );

        if (user) {
          await sendAdminOrderNotification(order, user);
        }

      } catch (emailError) {
      }

    } else {
      // Payment failed or pending - capture reason
      const isFailed = 
        status === false || 
        response?.Status === 'Failed' || 
        response?.ResultCode > 0 ||
        data?.response?.Status === 'FAILED' ||
        data?.response?.ResultCode !== 0 ||
        data?.status === 'FAILED';

      if (isFailed) {
        
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        
        // Store failure reason from M-Pesa (check multiple possible locations per Lipia docs)
        const failureReason = 
          response?.ResultDesc || 
          data?.response?.ResultDesc || 
          data?.ResultDesc ||
          data?.response?.customerMessage ||
          data?.customerMessage ||
          'Payment cancelled or declined';
        
        order.notes = `Payment failed: ${failureReason}`;
        
        await order.save();

      } else {
      }
    }

    // IMPORTANT: Must return plain text "ok" for Lipia acknowledgment
    return new NextResponse('ok', { status: 200 });

  } catch (error: any) {
    // Still return "ok" even on error to prevent webhook retries
    return new NextResponse('ok', { status: 200 });
  }
}

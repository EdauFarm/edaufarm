import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import Wallet from '@/models/Wallet';
import { authOptions } from '@/lib/auth';
import { sendOrderConfirmation, sendAdminOrderNotification, sendUserOrderCopy } from '@/lib/email';
import { generateOrderReceipt } from '@/lib/receipt';

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get user orders
 *     description: Retrieve paginated list of orders for authenticated user
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments({ userId: session.user.id });

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch orders', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create new order
 *     description: Create a new order with M-Pesa payment details
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *               - paymentMethod
 *               - mpesaCode
 *               - mpesaPhone
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   fullName:
 *                     type: string
 *                     example: John Doe
 *                   phone:
 *                     type: string
 *                     example: '+254712345678'
 *                   address:
 *                     type: string
 *                     example: '123 Kenyatta Avenue'
 *                   city:
 *                     type: string
 *                     example: Nairobi
 *                   county:
 *                     type: string
 *                     example: Nairobi
 *                   postalCode:
 *                     type: string
 *                     example: '00100'
 *               paymentMethod:
 *                 type: string
 *                 example: mpesa
 *               mpesaCode:
 *                 type: string
 *                 example: UAHJ643NOC
 *                 description: 10-character M-Pesa confirmation code
 *               mpesaPhone:
 *                 type: string
 *                 example: '+254712345678'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    await dbConnect();

    const body = await request.json();
    const { items, shippingAddress, paymentMethod, mpesaCode, mpesaPhone, walletAmount } = body;

    if (!items || items.length === 0 || !shippingAddress || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate email from shipping address for guest users
    if (!session?.user && !shippingAddress.email) {
      return NextResponse.json({ error: 'Email is required for checkout' }, { status: 400 });
    }

    let userId = session?.user?.id;
    let userEmail = session?.user?.email;
    let userName = session?.user?.name;
    let isGuestUser = false;

    // Handle guest users - create or find guest user account
    if (!session?.user) {
      const User = (await import('@/models/User')).default;
      const guestEmail = shippingAddress.email.toLowerCase();
      
      // Check if user already exists
      let existingUser = await User.findOne({ email: guestEmail });
      
      if (!existingUser) {
        // Create new guest user without password
        existingUser = await User.create({
          name: shippingAddress.fullName || 'Guest User',
          email: guestEmail,
          phone: shippingAddress.phone || '',
          password: Math.random().toString(36).substring(2, 15), // Temporary random password
          role: 'user',
          isVerified: false,
        });
        isGuestUser = true;
      }
      
      userId = existingUser._id.toString();
      userEmail = existingUser.email;
      userName = existingUser.name;
    }

    // Validate M-Pesa code if payment method includes mpesa
    if ((paymentMethod === 'mpesa' || paymentMethod === 'wallet+mpesa') && (!mpesaCode || !/^[A-Z0-9]{10}$/.test(mpesaCode))) {
      return NextResponse.json({ error: 'Invalid M-Pesa confirmation code. Must be 10 alphanumeric characters.' }, { status: 400 });
    }

    // Calculate totals (Kenya pricing)
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    
    // Tiered shipping calculation
    let shipping = 0;
    if (subtotal < 1000) {
      shipping = 95;
    } else if (subtotal < 10000) {
      shipping = 125;
    } else if (subtotal < 20000) {
      shipping = 200;
    } else {
      shipping = 0; // Free shipping above 20k
    }
    
    const fee = 0; // No service fee
    const total = subtotal + shipping + fee;

    // Handle wallet payment if applicable (only for authenticated users)
    let walletPayment = 0;
    if (session?.user && walletAmount && walletAmount > 0 && (paymentMethod === 'wallet' || paymentMethod === 'wallet+mpesa')) {
      const wallet = await Wallet.findOne({ userId: session.user.id });
      
      if (!wallet || wallet.balance < walletAmount) {
        return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
      }

      // Deduct from wallet
      wallet.balance -= walletAmount;
      wallet.transactions.push({
        type: 'purchase',
        amount: -walletAmount,
        status: 'completed',
        description: `Order payment - ${items.length} item(s)`,
        completedAt: new Date(),
      });
      await wallet.save();
      
      walletPayment = walletAmount;
    }

    // Fetch product details to check buyback eligibility
    const enrichedItems = await Promise.all(
      items.map(async (item: any) => {
        try {
          const product = await Product.findById(item.productId).lean();
          return {
            ...item,
            image: item.image || product?.images?.[0] || '/placeholder-product.png',
            buybackEligible: product?.buybackEnabled || false,
            buybackRequested: false,
          };
        } catch (error) {
          return {
            ...item,
            image: item.image || '/placeholder-product.png',
            buybackEligible: false,
            buybackRequested: false,
          };
        }
      })
    );

    // Generate order number
    const orderNumber = `GW-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await Order.create({
      userId,
      orderNumber,
      items: enrichedItems,
      subtotal,
      shipping,
      fee,
      tax: 0, // No longer using tax
      total,
      walletPayment,
      paymentMethod,
      mpesaCode: (paymentMethod === 'mpesa' || paymentMethod === 'wallet+mpesa') ? mpesaCode : undefined,
      mpesaPhone: (paymentMethod === 'mpesa' || paymentMethod === 'wallet+mpesa') ? mpesaPhone : undefined,
      mpesaVerified: false, // Admin will verify
      shippingAddress,
      status: 'pending',
      paymentStatus: paymentMethod === 'wallet' && walletPayment >= total ? 'paid' : 'pending',
    });

    // Generate PDF receipt
    try {
      const receiptBuffer = await generateOrderReceipt(order, { email: userEmail, name: userName, id: userId });
      
      // Send email to customer with receipt
      await sendOrderConfirmation(
        userEmail!,
        userName || 'Customer',
        order,
        receiptBuffer
      );
    } catch (emailError) {
      // Don't fail the order if email fails
    }

    // Send notification to admin
    try {
      await sendAdminOrderNotification(order, { email: userEmail, name: userName, id: userId });
    } catch (adminEmailError) {
    }

    // Send order copy to user
    try {
      await sendUserOrderCopy(order, { email: userEmail, name: userName, id: userId });
    } catch (userEmailError) {
    }

    // Send account setup email for guest users
    if (isGuestUser) {
      try {
        const { sendAccountSetupEmail } = await import('@/lib/email');
        await sendAccountSetupEmail(userEmail!, userName || 'Customer', order.orderNumber);
      } catch (setupEmailError) {
      }
    }

    // Clear cart (only for authenticated users)
    if (session?.user) {
      await Cart.findOneAndUpdate(
        { userId: session.user.id },
        { items: [], total: 0 }
      );
    }

    return NextResponse.json(
      { message: 'Order created successfully', order },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create order', message: error.message },
      { status: 500 }
    );
  }
}

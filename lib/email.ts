import { Resend } from 'resend';
import { render } from '@react-email/render';
import { OTPEmail } from './email-templates/OTPEmail';
import { OrderConfirmation } from './email-templates/OrderConfirmation';
import { FlashSaleEmail, AbandonedCartEmail } from './email-templates/FlashSaleEmail';
import { formatPrice } from './utils';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@updates.loopnet.tech';

// Generic email sending function
export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Edau Farm <edau@updates.loopnet.tech>',
      to,
      subject,
      html,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendOTPEmail(
  email: string,
  name: string,
  otp: string,
  purpose: 'verification' | 'password-reset'
) {
  try {
    const html = await render(
      OTPEmail({ name, otp, purpose })
    );

    const { data, error } = await resend.emails.send({
      from: 'Edau Farm <edau@updates.loopnet.tech>',
      to: email,
      subject: purpose === 'verification' ? 'Verify Your Email - Edau Farm' : 'Reset Your Password - Edau Farm',
      html,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderData: {
    name: string;
    orderNumber: string;
    orderDate: string;
    items: Array<{ title: string; quantity: number; price: number }>;
    subtotal: number;
    shipping: number;
    total: number;
    shippingAddress: string;
    estimatedDelivery: string;
  }
) {
  try {
    const html = await render(OrderConfirmation(orderData));

    const { data, error } = await resend.emails.send({
      from: 'Edau Farm Orders <edau@updates.loopnet.tech>',
      to: [email],
      subject: `Order Confirmation #${orderData.orderNumber} - Edau Farm`,
      html,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendFlashSaleEmail(
  email: string,
  name: string,
  products: Array<{
    title: string;
    price: number;
    compareAtPrice?: number;
    image: string;
    url: string;
  }>,
  endTime: string
) {
  try {
    const html = await render(
      FlashSaleEmail({ name, products, endTime })
    );

    const { data, error } = await resend.emails.send({
      from: 'Edau Farm Deals <edau@updates.loopnet.tech>',
      to: email,
      subject: '⚡ Seasonal Harvest Alert! Special Deals - Edau Farm',
      html,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendAbandonedCartEmail(
  email: string,
  name: string,
  items: Array<{
    title: string;
    price: number;
    compareAtPrice?: number;
    image: string;
    url: string;
  }>,
  cartTotal: number,
  cartUrl: string
) {
  try {
    const html = await render(
      AbandonedCartEmail({ name, items, cartTotal, cartUrl })
    );

    const { data, error } = await resend.emails.send({
      from: 'Edau Farm <edau@updates.loopnet.tech>',
      to: [email],
      subject: '🛒 You left items in your cart - Complete your purchase!',
      html,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP expiry time (10 minutes)
export function getOTPExpiry(): Date {
  return new Date(Date.now() + 10 * 60 * 1000);
}

// Send order confirmation to customer with PDF receipt
export async function sendOrderConfirmation(
  email: string,
  name: string,
  order: any,
  receiptPDF: Buffer
) {
  try {
    const orderData = {
      name,
      orderNumber: order.orderNumber,
      orderDate: new Date(order.createdAt).toLocaleString('en-KE'),
      items: order.items.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      shippingAddress: `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-KE'),
      paymentMethod: order.paymentMethod,
      mpesaCode: order.mpesaCode,
    };

    const html = await render(OrderConfirmation(orderData));

    const { data, error } = await resend.emails.send({
      from: 'Jumia Orders <jumia@updates.loopnet.tech>',
      to: [email],
      subject: `Order Confirmation #${order.orderNumber} - Jumia`,
      html,
      attachments: [
        {
          filename: `EdauFarm-Receipt-${order.orderNumber}.pdf`,
          content: receiptPDF,
        },
      ],
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

// Send order notification to admin
export async function sendAdminOrderNotification(order: any, user: any) {
  try {
    const html = `
      <h2>New Order Received - #${order.orderNumber}</h2>
      <p><strong>Customer:</strong> ${user.name || 'N/A'} (${user.email})</p>
      <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString('en-KE')}</p>
      <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
      ${order.mpesaCode ? `<p><strong>M-Pesa Code:</strong> ${order.mpesaCode}</p>` : ''}
      ${order.mpesaCode ? `<p style="color: orange;"><strong>⚠️ Action Required:</strong> Verify M-Pesa payment before processing</p>` : ''}
      
      <h3>Items:</h3>
      <ul>
        ${order.items.map((item: any) => `
          <li>${item.title} - Qty: ${item.quantity} - ${formatPrice(item.price * item.quantity)}</li>
        `).join('')}
      </ul>
      
      <h3>Shipping Address:</h3>
      <p>
        ${order.shippingAddress.fullName}<br>
        ${order.shippingAddress.phone}<br>
        ${order.shippingAddress.address}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.county}${order.shippingAddress.postalCode ? ' ' + order.shippingAddress.postalCode : ''}
      </p>
      
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${order._id}" style="background: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a></p>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Edau Farm System <edau@updates.loopnet.tech>',
      to: [ADMIN_EMAIL],
      subject: `🛒 New Order #${order.orderNumber} - ${formatPrice(order.total)}`,
      html,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

// Send order copy to user
export async function sendUserOrderCopy(order: any, user: any) {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4CAF50; margin: 0;">EDAU FARM</h1>
          <p style="color: #666; margin: 5px 0;">West Pokot's Premier Sustainable Farm</p>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 15px 0; color: #333;">Order #${order.orderNumber}</h2>
          <p style="margin: 5px 0; color: #666;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString('en-KE', { 
            dateStyle: 'full', 
            timeStyle: 'short' 
          })}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          ${order.mpesaCode ? `<p style="margin: 5px 0; color: #666;"><strong>M-Pesa Code:</strong> ${order.mpesaCode}</p>` : ''}
          ${order.mpesaCode && !order.mpesaVerified ? `<p style="color: orange; margin: 10px 0;"><strong>⏳ Pending:</strong> Your payment is being verified. We'll notify you once confirmed.</p>` : ''}
          ${order.mpesaVerified ? `<p style="color: green; margin: 10px 0;"><strong>✓ Paid:</strong> Payment verified successfully!</p>` : ''}
        </div>
        
        <h3 style="color: #333; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          ${order.items.map((item: any) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 15px 0;">
                <div style="font-weight: 500; color: #333;">${item.title}</div>
                <div style="color: #666; font-size: 14px;">Quantity: ${item.quantity}</div>
              </td>
              <td style="text-align: right; padding: 15px 0;">
                <div style="font-weight: 600; color: #ea580c;">${formatPrice(item.price * item.quantity)}</div>
              </td>
            </tr>
          `).join('')}
        </table>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span style="color: #666;">Subtotal:</span>
            <span style="font-weight: 500;">${formatPrice(order.subtotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span style="color: #666;">Shipping:</span>
            <span style="font-weight: 500;">${order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span style="color: #666;">VAT (16%):</span>
            <span style="font-weight: 500;">${formatPrice(order.tax)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 15px 0 0 0; padding-top: 15px; border-top: 2px solid #ddd;">
            <span style="font-size: 18px; font-weight: 600; color: #333;">Total:</span>
            <span style="font-size: 20px; font-weight: 700; color: #ea580c;">${formatPrice(order.total)}</span>
          </div>
        </div>
        
        <h3 style="color: #333; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">Shipping Address</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 5px 0; font-weight: 600; color: #333;">${order.shippingAddress.fullName}</p>
          <p style="margin: 5px 0; color: #666;">${order.shippingAddress.phone}</p>
          <p style="margin: 5px 0; color: #666;">${order.shippingAddress.address}</p>
          <p style="margin: 5px 0; color: #666;">${order.shippingAddress.city}, ${order.shippingAddress.county}${order.shippingAddress.postalCode ? ' ' + order.shippingAddress.postalCode : ''}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}" 
             style="background: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Track Your Order
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px;">
          <p>Need help? Contact us at <a href="mailto:support@updates.loopnet.tech" style="color: #ea580c;">support@updates.loopnet.tech</a></p>
          <p style="margin-top: 15px; color: #999; font-size: 12px;">© ${new Date().getFullYear()} Edau Farm. All rights reserved.</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Edau Farm Orders <edau@updates.loopnet.tech>',
      to: [user.email],
      subject: `Order Confirmation #${order.orderNumber} - Edau Farm`,
      html,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Send account setup email to guest users after order
 */
export async function sendAccountSetupEmail(
  email: string,
  name: string,
  orderNumber: string
) {
  try {
    const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/setup-account?email=${encodeURIComponent(email)}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4CAF50; margin: 0;">🌾 Welcome to Edau Farm!</h1>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Your Order Has Been Placed!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for your order <strong>#${orderNumber}</strong>! We're excited to have you as a customer.
          </p>
        </div>
        
        <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: white;">🔐 Complete Your Account Setup</h3>
          <p style="line-height: 1.6; margin-bottom: 20px;">
            To track your orders, manage returns, and enjoy exclusive benefits, please set up your password:
          </p>
          <div style="text-align: center;">
            <a href="${setupUrl}" 
               style="background: white; color: #ea580c; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 700; font-size: 16px;">
              Set Up Your Password
            </a>
          </div>
        </div>
        
        <div style="background: #fff3e0; border-left: 4px solid #ea580c; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h4 style="margin-top: 0; color: #333;">Benefits of Creating Your Account:</h4>
          <ul style="color: #666; line-height: 1.8; margin: 10px 0;">
            <li>Track all your orders in one place</li>
            <li>Save addresses for faster checkout</li>
            <li>Use wallet for quick payments</li>
            <li>Get exclusive deals and early access to sales</li>
            <li>Easy returns and buyback requests</li>
          </ul>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px;">
          <p>This link will expire in 7 days for security reasons.</p>
          <p style="margin-top: 15px;">
            Need help? Contact us at <a href="mailto:support@updates.loopnet.tech" style="color: #ea580c;">support@updates.loopnet.tech</a>
          </p>
          <p style="margin-top: 15px; color: #999; font-size: 12px;">© ${new Date().getFullYear()} Edau Farm. All rights reserved.</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Edau Farm <edau@updates.loopnet.tech>',
      to: [email],
      subject: 'Complete Your Account Setup - Edau Farm',
      html,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

import { Resend } from 'resend';

// Initialize Resend only if API key is available
const apiKey = process.env.RESEND_API_KEY;
export const resend = apiKey ? new Resend(apiKey) : null;

// Email sender configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Edau Farm <noreicle@edaufarm.com>';

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number }>();

export function storeOTP(email: string, otp: string): void {
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, { otp, expires });

  // Clean up expired OTPs
  setTimeout(() => otpStore.delete(email), 10 * 60 * 1000);
}

export function verifyOTP(email: string, otp: string): boolean {
  const stored = otpStore.get(email);

  if (!stored) return false;
  if (Date.now() > stored.expires) {
    otpStore.delete(email);
    return false;
  }

  if (stored.otp === otp) {
    otpStore.delete(email);
    return true;
  }

  return false;
}

// Email templates

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
}

interface MarketingEmailData {
  subject: string;
  title: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  if (!resend) {
    console.log('[Resend] Skipped order confirmation email (no API key configured)');
    return;
  }

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">KSh ${item.price.toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - Edau Farm</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2e7d32;">🌾 Edau Farm</h1>
        <p style="color: #666;">West Pokot's Premier Sustainable Farm</p>
      </div>

      <h2 style="color: #333;">Thank you for your order, ${data.customerName}!</h2>
      <p style="color: #666;">Your order <strong>#${data.orderNumber}</strong> has been confirmed.</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #2e7d32; color: white;">
              <th style="padding: 12px; text-align: left;">Product</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 15px; text-align: right;">
          <p style="margin: 5px 0; color: #666;">Subtotal: KSh ${data.subtotal.toLocaleString()}</p>
          <p style="margin: 5px 0; color: #666;">Shipping: KSh ${data.shipping.toLocaleString()}</p>
          <p style="margin: 10px 0; font-size: 18px; color: #2e7d32; font-weight: bold;">Total: KSh ${data.total.toLocaleString()}</p>
        </div>
      </div>

      <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #2e7d32;">Delivery Address</h4>
        <p style="margin: 0; color: #333;">${data.shippingAddress}</p>
      </div>

      <p style="color: #666; margin-top: 30px;">
        If you have any questions, please reply to this email or contact us on WhatsApp at +254 727 690165.
      </p>

      <p style="color: #999; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} Edau Farm. West Pokot, Kenya.
      </p>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.customerEmail,
    subject: `Order Confirmed - #${data.orderNumber} | Edau Farm`,
    html,
  });
}

/**
 * Send welcome email to new subscribers
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<void> {
  if (!resend) {
    console.log('[Resend] Skipped welcome email (no API key configured)');
    return;
  }

  const unsubscribeUrl = `https://edaufarm.com/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Edau Farm</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2e7d32;">🌾 Edau Farm</h1>
        <p style="color: #666;">West Pokot's Premier Sustainable Farm</p>
      </div>

      <h2 style="color: #333;">Welcome${name ? ` ${name}` : ''} to the Edau Farm Family!</h2>

      <p style="color: #666; line-height: 1.6;">
        Thank you for subscribing to our newsletter. You'll now receive updates about:
      </p>

      <ul style="color: #666; line-height: 1.8;">
        <li>🍯 Fresh seasonal harvests</li>
        <li>🥭 New product arrivals</li>
        <li>🐑 Special offers and discounts</li>
        <li>🌾 Farm visit opportunities</li>
        <li>📅 Events and farm news</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://edaufarm.com/products" style="background: #2e7d32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          Shop Our Products
        </a>
      </div>

      <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2e7d32; margin-top: 0;">🌿 Our Farm Promise</h3>
        <p style="color: #333; margin: 0;">
          100% organic, sustainably sourced products from the heart of West Pokot.
        </p>
      </div>

      <p style="color: #666; margin-top: 30px;">
        Connect with us on WhatsApp for quick responses: +254 727 690165
      </p>

      <p style="color: #999; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} Edau Farm. West Pokot, Kenya.
        <br><br>
        <a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a>
      </p>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Welcome to Edau Farm 🌾',
    html,
  });
}

/**
 * Send broadcast/marketing email to subscribers
 */
export async function sendBroadcastEmail(
  recipients: string[],
  data: MarketingEmailData
): Promise<void> {
  if (!resend) {
    console.log('[Resend] Skipped broadcast email (no API key configured)');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${data.subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2e7d32;">🌾 Edau Farm</h1>
        <p style="color: #666;">West Pokot's Premier Sustainable Farm</p>
      </div>

      <h2 style="color: #333;">${data.title}</h2>

      <div style="color: #666; line-height: 1.6;">
        ${data.content}
      </div>

      ${data.ctaText && data.ctaUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.ctaUrl}" style="background: #2e7d32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            ${data.ctaText}
          </a>
        </div>
      ` : ''}

      <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="color: #2e7d32; margin: 0;">
          📞 Order on WhatsApp: +254 727 690165
        </p>
      </div>

      <p style="color: #999; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} Edau Farm. West Pokot, Kenya.
        <br><br>
        <a href="https://edaufarm.com/api/newsletter/unsubscribe" style="color: #999;">Unsubscribe</a>
      </p>
    </body>
    </html>
  `;

  // Send in batches of 50 (Resend limit)
  for (let i = 0; i < recipients.length; i += 50) {
    const batch = recipients.slice(i, i + 50);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: batch,
      subject: data.subject,
      html,
    });
  }
}

/**
 * Send seasonal harvest notification
 */
export async function sendHarvestNotification(
  recipients: string[],
  products: Array<{ name: string; price: number; category: string }>
): Promise<void> {
  const productsHtml = products.map(p => `
    <div style="display: inline-block; width: 45%; margin: 2%; background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center;">
      <p style="font-size: 24px; margin: 0;">${p.category === 'honey' ? '🍯' : p.category === 'fruits' ? '🥭' : p.category === 'livestock' ? '🐑' : '🌿'}</p>
      <p style="font-weight: bold; margin: 10px 0 5px;">${p.name}</p>
      <p style="color: #2e7d32; margin: 0;">KSh ${p.price.toLocaleString()}</p>
    </div>
  `).join('');

  await sendBroadcastEmail(recipients, {
    subject: '🌾 Fresh Harvest Available at Edau Farm!',
    title: 'New Seasonal Products Available!',
    content: `
      <p>Great news from Edau Farm!</p>
      <p>We've just harvested fresh products ready for delivery:</p>
      <div style="margin: 20px 0;">
        ${productsHtml}
      </div>
      <p>Order now while supplies last!</p>
    `,
    ctaText: 'Shop Now',
    ctaUrl: 'https://edaufarm.com/products',
  });
}

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(email: string, otp: string, name?: string): Promise<void> {
  if (!resend) {
    console.log('[Resend] Skipped OTP email (no API key configured)');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email - Edau Farm</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2e7d32;">🌾 Edau Farm</h1>
      </div>

      <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>

      <p style="color: #666; text-align: center;">
        ${name ? `Hi ${name},` : 'Hello,'}<br><br>
        Please use the following code to verify your email address:
      </p>

      <div style="background: #e8f5e9; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <span style="font-size: 36px; font-weight: bold; color: #2e7d32; letter-spacing: 8px;">
          ${otp}
        </span>
      </div>

      <p style="color: #999; font-size: 14px; text-align: center;">
        This code will expire in 10 minutes.<br>
        If you didn't request this code, you can safely ignore this email.
      </p>

      <p style="color: #999; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} Edau Farm. West Pokot, Kenya.
      </p>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Your Verification Code - Edau Farm',
    html,
  });
}

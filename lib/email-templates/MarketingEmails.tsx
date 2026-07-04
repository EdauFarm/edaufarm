import { formatPrice } from '../utils';

export const OrderConfirmationHTML = (
  name: string,
  orderNumber: string,
  total: number,
  items: Array<{ title: string; quantity: number; price: number }>
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">✅ Order Confirmed!</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2>Hello ${name}!</h2>
      <p>Thank you for your order! We've received your order and will process it shortly.</p>
      
      <div style="background: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 30px 0;">
        <p style="margin: 0; font-size: 14px; color: #666;">Order Number</p>
        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #28a745;">${orderNumber}</p>
      </div>

      <h3>Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${items.map(item => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0;">${item.title} x ${item.quantity}</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold;">${formatPrice(item.price)}</td>
          </tr>
        `).join('')}
        <tr>
          <td style="padding: 15px 0; font-weight: bold; font-size: 18px;">Total</td>
          <td style="padding: 15px 0; text-align: right; font-weight: bold; font-size: 18px; color: #28a745;">${formatPrice(total)}</td>
        </tr>
      </table>

      <p style="margin-top: 30px;">You can track your order status in your account dashboard.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}" style="display: inline-block; padding: 12px 30px; background: #FF6B35; color: white; text-decoration: none; border-radius: 6px;">Track Order</a>
      </div>

      <p>Thank you for shopping with Edau Farm!</p>
      <p>The Edau Farm Team</p>
    </div>
    <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
      <p>© 2026 Edau Farm. All rights reserved.</p>
      <p>Questions? Contact us at support@updates.loopnet.tech</p>
    </div>
  </div>
</body>
</html>
`;

export const PromoEmailHTML = (
  name: string,
  promoTitle: string,
  promoDescription: string,
  discountCode: string,
  discountPercentage: number
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Special Offer Just for You!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎁 ${promoTitle}</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2>Hi ${name}!</h2>
      <p>${promoDescription}</p>
      
      <div style="background: linear-gradient(135deg, #FFE5D9 0%, #FFF0E8 100%); border: 2px solid #FF6B35; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
        <p style="margin: 0; font-size: 48px; font-weight: bold; color: #FF6B35;">${discountPercentage}% OFF</p>
        <p style="margin: 10px 0 20px 0; font-size: 18px; color: #666;">Use code at checkout</p>
        <div style="background: white; border: 2px dashed #FF6B35; border-radius: 8px; padding: 15px; display: inline-block;">
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #FF6B35; letter-spacing: 3px;">${discountCode}</p>
        </div>
        <p style="margin: 20px 0 0 0; font-size: 12px; color: #999;">Valid for 7 days</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" style="display: inline-block; padding: 15px 40px; background: #FF6B35; color: white; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">Shop Now</a>
      </div>

      <p style="margin-top: 30px;">Don't miss out on this exclusive offer!</p>
      <p>Happy Shopping!</p>
      <p>The Edau Farm Team</p>
    </div>
    <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
      <p>© 2026 Edau Farm. All rights reserved.</p>
      <p>Don't want these emails? <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/notifications" style="color: #FF6B35;">Manage preferences</a></p>
    </div>
  </div>
</body>
</html>
`;

export const AbandonedCartHTML = (
  name: string,
  cartItems: Array<{ title: string; price: number; image: string }>,
  cartTotal: number
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You Left Items in Your Cart</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Your Cart is Waiting!</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2>Hi ${name}!</h2>
      <p>We noticed you left some great items in your cart. Don't miss out on these amazing products!</p>
      
      ${cartItems.map(item => `
        <div style="border: 1px solid #eee; border-radius: 8px; padding: 15px; margin: 20px 0; display: flex; align-items: center;">
          <div style="flex: 1;">
            <p style="margin: 0; font-weight: bold; color: #333;">${item.title}</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #FF6B35;">${formatPrice(item.price)}</p>
          </div>
        </div>
      `).join('')}

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: bold;">Cart Total:</span>
          <span style="font-size: 24px; font-weight: bold; color: #FF6B35;">${formatPrice(cartTotal)}</span>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/cart" style="display: inline-block; padding: 15px 40px; background: #FF6B35; color: white; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">Complete Your Purchase</a>
      </div>

      <p style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">Hurry! Items in your cart are not reserved and may sell out.</p>
    </div>
    <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
      <p>© 2026 Edau Farm. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

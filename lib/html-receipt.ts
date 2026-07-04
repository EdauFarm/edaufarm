import { formatPrice } from './utils';

export function generateHTMLReceipt(order: any, user: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${order.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 40px; 
      max-width: 800px; 
      margin: 0 auto;
      background: white;
      color: #333;
    }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { color: #f68b1e; font-size: 32px; margin-bottom: 5px; }
    .header p { color: #666; font-size: 14px; }
    .receipt-title { 
      text-align: center; 
      font-size: 24px; 
      font-weight: bold; 
      margin: 20px 0;
      padding: 10px;
      background: #f5f5f5;
    }
    .info-section { margin: 30px 0; }
    .info-section h2 { 
      font-size: 16px; 
      font-weight: bold; 
      margin-bottom: 10px;
      border-bottom: 2px solid #f68b1e;
      padding-bottom: 5px;
    }
    .info-section p { 
      margin: 5px 0; 
      line-height: 1.6;
      font-size: 14px;
    }
    .items-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 30px 0;
    }
    .items-table th { 
      background: #f5f5f5; 
      padding: 12px; 
      text-align: left; 
      font-weight: bold;
      border-bottom: 2px solid #ddd;
    }
    .items-table td { 
      padding: 12px; 
      border-bottom: 1px solid #eee;
    }
    .items-table tr:hover { background: #fafafa; }
    .summary { 
      margin-top: 30px; 
      border-top: 2px solid #ddd;
      padding-top: 20px;
    }
    .summary-row { 
      display: flex; 
      justify-content: space-between; 
      padding: 8px 0;
      font-size: 14px;
    }
    .summary-row.total { 
      font-size: 18px; 
      font-weight: bold; 
      border-top: 2px solid #333;
      margin-top: 10px;
      padding-top: 15px;
    }
    .footer { 
      text-align: center; 
      margin-top: 50px; 
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 12px;
    }
    .verified { 
      display: inline-block;
      background: #22c55e;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-left: 5px;
    }
    .pending { 
      display: inline-block;
      background: #eab308;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-left: 5px;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="color: #4CAF50;">EDAU FARM</h1>
    <p>West Pokot's Premier Sustainable Farm</p>
  </div>

  <div class="receipt-title">ORDER RECEIPT</div>

  <div class="info-section">
    <h2>Order Information</h2>
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString('en-KE', { dateStyle: 'long', timeStyle: 'short' })}</p>
    <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
    ${order.mpesaCode ? `<p><strong>M-Pesa Code:</strong> ${order.mpesaCode}</p>` : ''}
    <p><strong>Payment Status:</strong> ${order.mpesaVerified ? '<span class="verified">Verified ✓</span>' : '<span class="pending">Pending Verification</span>'}</p>
  </div>

  <div class="info-section">
    <h2>Customer Information</h2>
    <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
  </div>

  <div class="info-section">
    <h2>Shipping Address</h2>
    <p>${order.shippingAddress.fullName}</p>
    <p>${order.shippingAddress.address}</p>
    <p>${order.shippingAddress.city}, ${order.shippingAddress.county}</p>
    ${order.shippingAddress.postalCode ? `<p>Postal Code: ${order.shippingAddress.postalCode}</p>` : ''}
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align: center;">Quantity</th>
        <th style="text-align: right;">Price</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map((item: any) => `
        <tr>
          <td>${item.title}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">${formatPrice(item.price)}</td>
          <td style="text-align: right;">${formatPrice(item.price * item.quantity)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-row">
      <span>Subtotal:</span>
      <span>${formatPrice(order.subtotal)}</span>
    </div>
    <div class="summary-row">
      <span>Shipping:</span>
      <span>${order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
    </div>
    <div class="summary-row">
      <span>VAT (16%):</span>
      <span>${formatPrice(order.tax)}</span>
    </div>
    <div class="summary-row total">
      <span>TOTAL:</span>
      <span>${formatPrice(order.total)}</span>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for shopping with Edau Farm!</p>
    <p>For support, contact us at support@updates.loopnet.tech | +254 700 000 000</p>
    <p style="margin-top: 10px;" class="no-print">
      <button onclick="window.print()" style="background: #f68b1e; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px;">Print Receipt</button>
    </p>
  </div>
</body>
</html>
  `;
}

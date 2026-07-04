import * as React from 'react';
import { formatPrice } from '../utils';

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationProps {
  name: string;
  orderNumber: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: string;
  estimatedDelivery: string;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  name,
  orderNumber,
  orderDate,
  items,
  subtotal,
  shipping,
  total,
  shippingAddress,
  estimatedDelivery,
}) => {
  return (
    <html>
      <head>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0 0 10px;
            font-size: 28px;
          }
          .success-icon {
            font-size: 60px;
            margin-bottom: 10px;
          }
          .content {
            padding: 30px;
          }
          .order-info {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-label {
            font-weight: 600;
            color: #6b7280;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .items-table th {
            background: #f9fafb;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
          }
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .total-row {
            font-weight: bold;
            font-size: 18px;
            color: #f97316;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: #f97316;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div className="success-icon">✓</div>
            <h1>Order Confirmed!</h1>
            <p style={{ margin: 0 }}>Thank you for your purchase</p>
          </div>
          
          <div className="content">
            <h2>Hi {name},</h2>
            <p>Great news! Your order has been confirmed and is being prepared for shipment.</p>
            
            <div className="order-info">
              <div className="info-row">
                <span className="info-label">Order Number:</span>
                <span><strong>{orderNumber}</strong></span>
              </div>
              <div className="info-row">
                <span className="info-label">Order Date:</span>
                <span>{orderDate}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Estimated Delivery:</span>
                <span><strong>{estimatedDelivery}</strong></span>
              </div>
            </div>

            <h3>Order Items</h3>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.title}</td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.price)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2}>Subtotal</td>
                  <td>{formatPrice(subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={2}>Shipping</td>
                  <td>{formatPrice(shipping)}</td>
                </tr>
                <tr className="total-row">
                  <td colSpan={2}>Total</td>
                  <td>{formatPrice(total)}</td>
                </tr>
              </tbody>
            </table>

            <h3>Shipping Address</h3>
            <div className="order-info">
              <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{shippingAddress}</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <a href={`${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}`} className="button">
                Track Your Order
              </a>
            </div>

            <p style={{ marginTop: '30px', fontSize: '14px', color: '#6b7280' }}>
              Need help? Contact our support team at support@updates.loopnet.tech
            </p>
          </div>
          
          <div className="footer">
            <p>© 2026 Edau Farm. All rights reserved.</p>
            <p>You're receiving this email because you made a purchase at Edau Farm.</p>
          </div>
        </div>
      </body>
    </html>
  );
};

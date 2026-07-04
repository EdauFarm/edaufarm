import * as React from 'react';
import { formatPrice } from '../utils';

interface Product {
  title: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  url: string;
}

interface FlashSaleEmailProps {
  name: string;
  products: Product[];
  endTime: string;
}

export const FlashSaleEmail: React.FC<FlashSaleEmailProps> = ({ name, products, endTime }) => {
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
            max-width: 650px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
            text-transform: uppercase;
          }
          .countdown {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 30px;
          }
          .products-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          .product-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.2s;
          }
          .product-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
          }
          .product-info {
            padding: 15px;
          }
          .product-title {
            font-size: 14px;
            margin: 0 0 10px;
            font-weight: 600;
            line-height: 1.4;
          }
          .price-box {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .price {
            font-size: 20px;
            font-weight: bold;
            color: #dc2626;
          }
          .old-price {
            font-size: 14px;
            text-decoration: line-through;
            color: #9ca3af;
          }
          .discount-badge {
            background: #dc2626;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          .cta-button {
            display: inline-block;
            padding: 16px 40px;
            background: #dc2626;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
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
            <h1>⚡ FLASH SALE ⚡</h1>
            <p style={{ fontSize: '18px', margin: '10px 0' }}>Limited Time Only!</p>
            <div className="countdown">
              ⏰ Ends in {endTime}
            </div>
          </div>
          
          <div className="content">
            <h2>Hi {name}!</h2>
            <p style={{ fontSize: '16px' }}>
              Don't miss out on these incredible deals! Our flash sale is live with up to <strong>70% OFF</strong> on selected items.
            </p>
            
            <div className="products-grid">
              {products.map((product, index) => {
                const discount = product.compareAtPrice 
                  ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                  : 0;
                
                return (
                  <div key={index} className="product-card">
                    <img src={product.image} alt={product.title} className="product-image" />
                    <div className="product-info">
                      <h3 className="product-title">{product.title}</h3>
                      <div className="price-box">
                        <span className="price">${product.price}</span>
                        {product.compareAtPrice && (
                          <>
                            <span className="old-price">${product.compareAtPrice}</span>
                            <span className="discount-badge">-{discount}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <a href={`${process.env.NEXT_PUBLIC_APP_URL}/flash-sales`} className="cta-button">
                SHOP ALL DEALS →
              </a>
            </div>

            <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '8px', marginTop: '30px' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <strong>⚡ Hurry!</strong> Stock is limited and selling fast. These prices won't last long!
              </p>
            </div>
          </div>
          
          <div className="footer">
            <p>© 2026 Edau Farm. All rights reserved.</p>
            <p>You're receiving this because you subscribed to Edau Farm marketing emails.</p>
            <p><a href="#" style={{ color: '#6b7280' }}>Unsubscribe</a> | <a href="#" style={{ color: '#6b7280' }}>Update Preferences</a></p>
          </div>
        </div>
      </body>
    </html>
  );
};

interface AbandonedCartEmailProps {
  name: string;
  items: Product[];
  cartTotal: number;
  cartUrl: string;
}

export const AbandonedCartEmail: React.FC<AbandonedCartEmailProps> = ({
  name,
  items,
  cartTotal,
  cartUrl,
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
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
          }
          .cart-item {
            display: flex;
            gap: 15px;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin: 15px 0;
          }
          .item-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 6px;
          }
          .item-details {
            flex: 1;
          }
          .item-title {
            font-weight: 600;
            margin: 0 0 5px;
          }
          .item-price {
            color: #f97316;
            font-size: 18px;
            font-weight: bold;
          }
          .total-box {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
          }
          .total-amount {
            font-size: 32px;
            font-weight: bold;
            color: #f97316;
          }
          .cta-button {
            display: inline-block;
            padding: 16px 40px;
            background: #1f2937;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
          }
          .discount-badge {
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            display: inline-block;
            margin: 15px 0;
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
            <h1>🛒 Your Cart is Waiting!</h1>
            <p style={{ margin: '10px 0 0', fontSize: '16px' }}>You left some items behind...</p>
          </div>
          
          <div className="content">
            <h2>Hi {name},</h2>
            <p>We noticed you left some great items in your cart. They're still available and waiting for you!</p>
            
            <div style={{ margin: '25px 0' }}>
              {items.slice(0, 3).map((item, index) => (
                <div key={index} className="cart-item">
                  <img src={item.image} alt={item.title} className="item-image" />
                  <div className="item-details">
                    <div className="item-title">{item.title}</div>
                    <div className="item-price">${item.price}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="total-box">
              <p style={{ margin: '0 0 10px', fontSize: '16px', color: '#6b7280' }}>Cart Total</p>
              <div className="total-amount">{formatPrice(cartTotal)}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div className="discount-badge">
                🎁 Complete your purchase and get FREE SHIPPING!
              </div>
              <br />
              <a href={cartUrl} className="cta-button">
                COMPLETE MY PURCHASE →
              </a>
            </div>

            <p style={{ marginTop: '30px', fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
              ⚡ Hurry! Items in your cart are selling fast and may go out of stock soon.
            </p>
          </div>
          
          <div className="footer">
            <p>© 2026 Edau Farm. All rights reserved.</p>
            <p>Need help? Contact us at support@updates.loopnet.tech</p>
          </div>
        </div>
      </body>
    </html>
  );
};

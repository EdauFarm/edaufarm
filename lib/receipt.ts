import PDFDocument from 'pdfkit';
import { formatPrice } from './utils';

export async function generateOrderReceipt(order: any, user: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', (err) => {
        reject(err);
      });

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('EDAU FARM', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('West Pokot\'s Premier Sustainable Farm', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).font('Helvetica-Bold').text('ORDER RECEIPT', { align: 'center' });
      doc.moveDown(2);

      // Order Info
      doc.fontSize(10).font('Helvetica-Bold').text(`Order Number: ${order.orderNumber}`);
      doc.font('Helvetica').text(`Order Date: ${new Date(order.createdAt).toLocaleString('en-KE')}`);
      doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`);
      if (order.mpesaCode) {
        doc.text(`M-Pesa Code: ${order.mpesaCode}`);
        doc.text(`Payment Status: ${order.mpesaVerified ? 'Verified ✓' : 'Pending Verification'}`);
      }
      doc.moveDown();

      // Customer Info
      doc.font('Helvetica-Bold').text('Customer Information:');
      doc.font('Helvetica').text(`Name: ${user.name || 'N/A'}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Phone: ${order.shippingAddress.phone}`);
      doc.moveDown();

      // Shipping Address
      doc.font('Helvetica-Bold').text('Shipping Address:');
      doc.font('Helvetica').text(`${order.shippingAddress.fullName}`);
      doc.text(`${order.shippingAddress.address}`);
      doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.county}`);
      if (order.shippingAddress.postalCode) {
        doc.text(`Postal Code: ${order.shippingAddress.postalCode}`);
      }
      doc.moveDown(2);

      // Items Table Header
      const tableTop = doc.y;
      const itemX = 50;
      const qtyX = 300;
      const priceX = 370;
      const totalX = 470;

      doc.font('Helvetica-Bold');
      doc.text('Item', itemX, tableTop);
      doc.text('Qty', qtyX, tableTop);
      doc.text('Price', priceX, tableTop);
      doc.text('Total', totalX, tableTop);
      doc.moveTo(itemX, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      
      // Items
      let y = tableTop + 25;
      doc.font('Helvetica').fontSize(9);
      
      order.items.forEach((item: any) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        
        const itemTotal = item.price * item.quantity;
        doc.text(item.title.substring(0, 40), itemX, y, { width: 240 });
        doc.text(item.quantity.toString(), qtyX, y);
        doc.text(formatPrice(item.price), priceX, y);
        doc.text(formatPrice(itemTotal), totalX, y);
        y += 30;
      });

      // Summary
      doc.moveDown();
      y = doc.y + 10;
      doc.fontSize(10);
      
      const summaryX = 370;
      doc.moveTo(itemX, y).lineTo(550, y).stroke();
      y += 10;
      
      doc.text('Subtotal:', summaryX, y);
      doc.text(formatPrice(order.subtotal), totalX, y);
      y += 20;
      
      doc.text('Shipping:', summaryX, y);
      doc.text(order.shipping === 0 ? 'FREE' : formatPrice(order.shipping), totalX, y);
      y += 20;
      
      doc.text('VAT (16%):', summaryX, y);
      doc.text(formatPrice(order.tax), totalX, y);
      y += 20;
      
      doc.moveTo(summaryX, y).lineTo(550, y).stroke();
      y += 10;
      
      doc.font('Helvetica-Bold').fontSize(12);
      doc.text('TOTAL:', summaryX, y);
      doc.text(formatPrice(order.total), totalX, y);

      // Footer
      doc.fontSize(8).font('Helvetica').text(
        'Thank you for shopping with Edau Farm!',
        50,
        750,
        { align: 'center' }
      );
      doc.text(
        'For support, contact us at support@updates.loopnet.tech | +254 700 000 000',
        50,
        760,
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

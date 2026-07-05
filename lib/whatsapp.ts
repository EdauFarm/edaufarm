// WhatsApp utility for Edau Farm
// WhatsApp number: +254 727 690165

export const WHATSAPP_NUMBER = '+254727690165';

interface CartItem {
  name: string;
  quantity: number;
  price: number;
  unit_type?: string;
}

interface OrderDetails {
  items: CartItem[];
  total: number;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  notes?: string;
}

/**
 * Format a phone number for WhatsApp link
 */
export function formatWhatsAppNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Get WhatsApp link with pre-filled message
 */
export function getWhatsAppLink(message: string, number: string = WHATSAPP_NUMBER): string {
  const formattedNumber = formatWhatsAppNumber(number);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
}

/**
 * Format cart items for WhatsApp message
 */
function formatCartItems(items: CartItem[]): string {
  return items.map((item, index) => {
    const unit = item.unit_type || 'piece';
    return `${index + 1}. ${item.name} - ${item.quantity} ${unit} @ KSh ${item.price.toLocaleString()} = KSh ${(item.price * item.quantity).toLocaleString()}`;
  }).join('\n');
}

/**
 * Generate WhatsApp order message from cart
 */
export function generateOrderMessage(order: OrderDetails): string {
  const itemsList = formatCartItems(order.items);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  let message = `🌾 *EDAU FARM ORDER*\n`;
  message += `━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📦 *Order Details:*\n${itemsList}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *Total:* KSh ${order.total.toLocaleString()}\n`;
  message += `📊 *Items:* ${totalItems}\n\n`;

  if (order.customerName) {
    message += `👤 *Name:* ${order.customerName}\n`;
  }
  if (order.customerPhone) {
    message += `📱 *Phone:* ${order.customerPhone}\n`;
  }
  if (order.deliveryAddress) {
    message += `📍 *Delivery:* ${order.deliveryAddress}\n`;
  }
  if (order.notes) {
    message += `📝 *Notes:* ${order.notes}\n`;
  }

  message += `\n✅ I'd like to place this order. Please confirm availability and delivery details.`;

  return message;
}

/**
 * Generate WhatsApp inquiry message for a single product
 */
export function generateProductInquiry(product: { name: string; price: number; id: string }, quantity: number = 1): string {
  return `🌾 *EDAU FARM PRODUCT INQUIRY*%0A%0A` +
    `I'm interested in:%0A` +
    `📦 ${product.name}%0A` +
    `💰 KSh ${product.price.toLocaleString()}%0A` +
    `📊 Quantity: ${quantity}%0A%0A` +
    `Please confirm availability and delivery options.`;
}

/**
 * Generate bulk order inquiry message
 */
export function generateBulkInquiry(products: Array<{ name: string; price: number; quantity: number }>): string {
  const productList = products.map((p, i) =>
    `${i + 1}. ${p.name} x${p.quantity} @ KSh ${p.price.toLocaleString()}`
  ).join('%0A');

  return `🌾 *EDAU FARM BULK ORDER INQUIRY*%0A%0A` +
    `I'd like to order the following:%0A%0A${productList}%0A%0A` +
    `Please provide pricing and delivery details for this bulk order.`;
}

/**
 * Generate farm visit booking message
 */
export function generateFarmVisitMessage(details: {
  name: string;
  phone: string;
  date: string;
  guests: number;
  interests?: string;
}): string {
  let message = `🌾 *EDAU FARM VISIT BOOKING*%0A%0A`;
  message += `I'd like to book a farm visit:%0A%0A`;
  message += `👤 Name: ${details.name}%0A`;
  message += `📱 Phone: ${details.phone}%0A`;
  message += `📅 Preferred Date: ${details.date}%0A`;
  message += `👥 Number of Guests: ${details.guests}%0A`;
  if (details.interests) {
    message += `🎯 Interests: ${details.interests}%0A`;
  }
  message += `%0APlease confirm availability and pricing.`;

  return message;
}

/**
 * Simple WhatsApp contact link
 */
export function getContactLink(): string {
  return `https://wa.me/${formatWhatsAppNumber(WHATSAPP_NUMBER)}`;
}

/**
 * Share product on WhatsApp
 */
export function shareProductOnWhatsApp(product: { name: string; price: number; id: string }): string {
  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://edaufarm.com'}/products/${product.id}`;
  return `Check out ${product.name} from Edau Farm! 🌾%0A%0A💰 KSh ${product.price.toLocaleString()}%0A%0A${productUrl}`;
}

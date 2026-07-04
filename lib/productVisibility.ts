import Product from '@/models/Product';
import Order from '@/models/Order';
import mongoose from 'mongoose';

/**
 * Automatically manage product visibility based on stock and order status
 */
export async function updateProductVisibility(productId: string | mongoose.Types.ObjectId) {
  try {
    const product = await Product.findById(productId);
    if (!product) return;

    let shouldBeInactive = false;

    // Rule 1: Product is out of stock
    if (product.stock <= 0) {
      shouldBeInactive = true;
    }

    // Rule 2: Product has pending orders and is out of stock
    if (product.stock <= 0) {
      const pendingOrders = await Order.find({
        status: { $in: ['pending', 'pending-payment'] },
        'items.productId': productId,
      });

      if (pendingOrders.length > 0) {
        shouldBeInactive = true;
      }
    }

    // Rule 3: Product has been delivered and is now out of stock
    if (product.stock <= 0) {
      const deliveredOrders = await Order.find({
        status: 'delivered',
        'items.productId': productId,
      });

      if (deliveredOrders.length > 0) {
        shouldBeInactive = true;
      }
    }

    // Update product active status if needed
    if (shouldBeInactive && product.active) {
      product.active = false;
      await product.save();
    } else if (!shouldBeInactive && !product.active && product.stock > 0) {
      // Reactivate if stock is available
      product.active = true;
      await product.save();
    }

  } catch (error) {
  }
}

/**
 * Update visibility for all products in an order
 */
export async function updateOrderProductsVisibility(orderId: string | mongoose.Types.ObjectId) {
  try {
    const order = await Order.findById(orderId);
    if (!order) return;

    // Update visibility for each product in the order
    for (const item of order.items) {
      await updateProductVisibility(item.productId);
    }

  } catch (error) {
  }
}

/**
 * Batch update visibility for all products
 */
export async function batchUpdateProductVisibility() {
  try {
    const products = await Product.find({});
    let updated = 0;

    for (const product of products) {
      const wasActive = product.active;
      await updateProductVisibility(product._id);
      
      // Check if status changed
      const updatedProduct = await Product.findById(product._id);
      if (updatedProduct && updatedProduct.active !== wasActive) {
        updated++;
      }
    }

    return { updated };

  } catch (error) {
    return { updated: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

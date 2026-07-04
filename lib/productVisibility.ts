import { supabase } from './supabase';

export async function updateProductVisibility(productId: string) {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', productId)
      .maybeSingle();

    if (error || !product) return;

    const shouldBeInStock = product.quantity > 0;

    await supabase
      .from('products')
      .update({ is_in_stock: shouldBeInStock })
      .eq('id', productId);
  } catch (error) {
    console.error('Error updating product visibility:', error);
  }
}

export async function updateOrderProductsVisibility(orderId: string) {
  try {
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select('product_id')
      .eq('order_id', orderId);

    if (error || !orderItems) return;

    for (const item of orderItems) {
      if (item.product_id) {
        await updateProductVisibility(item.product_id);
      }
    }
  } catch (error) {
    console.error('Error updating order products visibility:', error);
  }
}

export async function batchUpdateProductVisibility() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, quantity, is_in_stock');

    if (error || !products) return { updated: 0 };

    let updated = 0;

    for (const product of products) {
      const shouldBeInStock = product.quantity > 0;
      if (shouldBeInStock !== product.is_in_stock) {
        await supabase
          .from('products')
          .update({ is_in_stock: shouldBeInStock })
          .eq('id', product.id);
        updated++;
      }
    }

    return { updated };
  } catch (error) {
    console.error('Error in batch update:', error);
    return { updated: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

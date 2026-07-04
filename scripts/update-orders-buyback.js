/**
 * Script to update existing orders with buyback eligibility
 * This will check each order item and mark it as buyback eligible
 * based on the product's buybackEnabled field
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function updateOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');
    const productsCollection = db.collection('products');

    // Get all orders
    const orders = await ordersCollection.find({}).toArray();
    console.log(`📦 Found ${orders.length} orders to process\n`);

    let updatedCount = 0;

    for (const order of orders) {
      let orderNeedsUpdate = false;
      const updatedItems = [];

      for (const item of order.items) {
        // Fetch the product to check buyback eligibility
        const product = await productsCollection.findOne({ _id: item.productId });
        
        const updatedItem = {
          ...item,
          buybackEligible: product?.buybackEnabled || false,
          buybackRequested: item.buybackRequested || false,
        };

        if (item.buybackEligible === undefined) {
          orderNeedsUpdate = true;
        }

        updatedItems.push(updatedItem);
      }

      if (orderNeedsUpdate) {
        await ordersCollection.updateOne(
          { _id: order._id },
          { 
            $set: { 
              items: updatedItems,
              updatedAt: new Date()
            }
          }
        );
        
        updatedCount++;
        console.log(`✅ Updated Order #${order.orderNumber}`);
        
        // Show item details
        updatedItems.forEach(item => {
          const eligibility = item.buybackEligible ? '✓ Eligible' : '✗ Not eligible';
          const requested = item.buybackRequested ? ' (Requested)' : '';
          console.log(`   - ${item.title}: ${eligibility}${requested}`);
        });
        console.log('');
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} orders`);
    console.log(`⏭️  Skipped ${orders.length - updatedCount} orders (already updated)\n`);

    // Show summary
    const summary = await ordersCollection.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          buybackEligibleItems: {
            $sum: { $cond: ['$items.buybackEligible', 1, 0] }
          },
          buybackRequestedItems: {
            $sum: { $cond: ['$items.buybackRequested', 1, 0] }
          }
        }
      }
    ]).toArray();

    if (summary.length > 0) {
      const stats = summary[0];
      console.log('📊 Order Items Summary:');
      console.log(`  Total items in orders: ${stats.totalItems}`);
      console.log(`  Buyback eligible items: ${stats.buybackEligibleItems}`);
      console.log(`  Buyback requested items: ${stats.buybackRequestedItems}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateOrders();

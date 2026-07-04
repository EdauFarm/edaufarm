const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mosionofficial:Fh3FtXNAqXxuMWNB@cluster0.9uqb3.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

async function testBuybackAndReceipt() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }), 'orders');
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'products');

    // Get all orders first
    const orders = await Order.find({}).lean();
    console.log(`📊 Total orders found: ${orders.length}\n`);
    
    if (orders.length === 0) {
      console.log('❌ No orders in database');
      await mongoose.disconnect();
      return;
    }

    // Get the first order (or specific one)
    const order = orders[0];
    
    if (!order) {
      console.log('❌ Order not found');
      return;
    }

    console.log('📦 Order Details:');
    console.log(`   Order Number: ${order.orderNumber}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Created: ${order.createdAt}`);
    console.log(`   Items: ${order.items.length}`);
    console.log();

    // Check each item
    for (const item of order.items) {
      console.log(`📱 Item: ${item.title}`);
      console.log(`   Product ID: ${item.productId}`);
      console.log(`   buybackEligible: ${item.buybackEligible}`);
      console.log(`   buybackRequested: ${item.buybackRequested}`);
      
      // Get product details
      const product = await Product.findById(item.productId).lean();
      if (product) {
        console.log(`   Product buybackEnabled: ${product.buybackEnabled}`);
      }
      
      // Calculate days since order
      const orderAge = Date.now() - new Date(order.createdAt).getTime();
      const daysOld = orderAge / (24 * 60 * 60 * 1000);
      const daysRemaining = Math.ceil(7 - daysOld);
      
      console.log(`   Days since order: ${daysOld.toFixed(2)}`);
      console.log(`   Days until buyback available: ${daysRemaining}`);
      
      // Check buyback eligibility
      const canRequest = item.buybackEligible && 
                        !item.buybackRequested && 
                        (order.status === 'shipped' || order.status === 'delivered') &&
                        (order.status === 'shipped' || daysOld >= 7);
      
      console.log(`   Can request buyback now: ${canRequest ? '✅ YES' : '❌ NO'}`);
      
      if (!canRequest && item.buybackEligible && !item.buybackRequested) {
        if (order.status !== 'shipped' && order.status !== 'delivered') {
          console.log(`   Reason: Order must be shipped or delivered`);
        } else if (daysOld < 7) {
          console.log(`   Reason: Must wait ${daysRemaining} more day(s)`);
        }
      }
      console.log();
    }

    // Check receipt generation requirements
    console.log('📄 Receipt Status:');
    console.log(`   Order status allows receipt: ${order.status === 'delivered' ? '✅ YES' : '❌ NO (must be delivered)'}`);
    console.log(`   Has shipping address: ${order.shippingAddress ? '✅ YES' : '❌ NO'}`);
    console.log(`   Has items: ${order.items && order.items.length > 0 ? '✅ YES' : '❌ NO'}`);
    console.log();

    console.log('✅ Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Disconnected');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testBuybackAndReceipt();

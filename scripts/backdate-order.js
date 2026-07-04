const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mosionofficial:Fh3FtXNAqXxuMWNB@cluster0.9uqb3.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

async function backdateOrder() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }), 'orders');

    // Find all orders first
    const orders = await Order.find({});
    console.log(`📊 Total orders found: ${orders.length}\n`);
    
    if (orders.length === 0) {
      console.log('❌ No orders in database');
      await mongoose.disconnect();
      return;
    }

    // Get the first order (should be the Nivea order)
    const order = orders[0];

    console.log('📦 Found Order:');
    console.log(`   Order Number: ${order.orderNumber}`);
    console.log(`   Current createdAt: ${order.createdAt}`);
    console.log(`   Status: ${order.status}`);
    
    // Calculate date 4 days ago
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    
    console.log(`\n⏰ Backdating order to 4 days ago: ${fourDaysAgo}`);
    
    // Update the order
    const result = await Order.updateOne(
      { _id: order._id },
      { 
        $set: { 
          createdAt: fourDaysAgo,
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log('\n✅ Order successfully backdated!');
      
      // Verify the update
      const updatedOrder = await Order.findById(order._id);
      console.log(`   New createdAt: ${updatedOrder.createdAt}`);
      
      const daysOld = (Date.now() - new Date(updatedOrder.createdAt).getTime()) / (24 * 60 * 60 * 1000);
      console.log(`   Order is now ${daysOld.toFixed(2)} days old`);
      console.log(`   Buyback available: ${daysOld >= 2 ? '✅ YES (>= 2 days)' : '❌ NO (< 2 days)'}`);
    } else {
      console.log('\n⚠️ No changes made');
    }

    console.log('\n✅ Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Disconnected');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

backdateOrder();

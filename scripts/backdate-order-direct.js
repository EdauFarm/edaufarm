require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mosionofficial:Fh3FtXNAqXxuMWNB@cluster0.9uqb3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function backdateOrder() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('ecommerce');
    const orders = db.collection('orders');

    const orderId = new ObjectId('697ecd8c5bf28eaba5d1faef');
    
    // Get current order
    const order = await orders.findOne({ _id: orderId });
    
    if (!order) {
      console.log('❌ Order not found');
      return;
    }

    console.log('📦 Current Order Status:');
    console.log(`   Order Number: ${order.orderNumber}`);
    console.log(`   Current createdAt: ${order.createdAt}`);
    console.log(`   Status: ${order.status}`);
    
    const currentAge = (Date.now() - new Date(order.createdAt).getTime()) / (24 * 60 * 60 * 1000);
    console.log(`   Current age: ${currentAge.toFixed(2)} days`);
    console.log(`   Buyback available: ${currentAge >= 2 ? '✅ YES' : '❌ NO (needs 2 days)'}`);
    
    // Calculate date 4 days ago
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    
    console.log(`\n⏰ Updating order to 4 days ago: ${fourDaysAgo.toISOString()}`);
    
    // Update the order
    const result = await orders.updateOne(
      { _id: orderId },
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
      const updatedOrder = await orders.findOne({ _id: orderId });
      console.log(`   New createdAt: ${updatedOrder.createdAt}`);
      
      const newAge = (Date.now() - new Date(updatedOrder.createdAt).getTime()) / (24 * 60 * 60 * 1000);
      console.log(`   New age: ${newAge.toFixed(2)} days`);
      console.log(`   Buyback available: ${newAge >= 2 ? '✅ YES (past 2-day requirement!)' : '❌ NO'}`);
      console.log(`\n🎉 Buyback button should now be active on the order page!`);
    } else {
      console.log('\n⚠️ No changes made');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

backdateOrder();

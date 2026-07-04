const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function createBuybackOrders() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('ecommerce');
    
    // Get customer user
    const customer = await db.collection('users').findOne({ email: 'nathanmmoja@gmail.com' });
    if (!customer) {
      console.error('Customer not found!');
      process.exit(1);
    }
    
    console.log(`Customer: ${customer.name} (${customer.email})`);
    
    // Get 4 products
    const products = await db.collection('products').find({}).limit(4).toArray();
    console.log(`Found ${products.length} products`);
    
    // Calculate date 8 days ago for buyback eligibility
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    
    // Create 4 orders
    const orders = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const orderNumber = `GW-${Date.now()}-${i}`;
      
      const order = {
        orderNumber,
        user: customer._id,
        items: [{
          product: product._id,
          quantity: 1,
          price: product.price
        }],
        totalAmount: product.price,
        status: 'delivered',
        paymentMethod: 'mpesa',
        paymentStatus: 'paid',
        mpesaCode: `MPE${Date.now()}${i}`,
        mpesaPhone: customer.phone,
        mpesaVerified: true,
        shippingAddress: {
          fullName: customer.name,
          phone: customer.phone,
          address: '123 Main Street',
          city: 'Nairobi',
          county: 'Nairobi'
        },
        createdAt: eightDaysAgo,
        updatedAt: new Date()
      };
      
      orders.push(order);
    }
    
    const result = await db.collection('orders').insertMany(orders);
    console.log(`\n✅ Created ${result.insertedCount} delivered orders (8 days old)`);
    
    // Display order details
    orders.forEach((order, index) => {
      console.log(`\nOrder ${index + 1}:`);
      console.log(`  Order Number: ${order.orderNumber}`);
      console.log(`  Product: ${products[index].title}`);
      console.log(`  Amount: KSh ${order.totalAmount.toLocaleString()}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Created: ${order.createdAt.toISOString()}`);
    });
    
    console.log(`\n✅ All orders are eligible for buyback (7+ days old, delivered status)`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ Done!');
  }
}

createBuybackOrders();

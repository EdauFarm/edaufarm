const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function updateSeller() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('ecommerce');
    
    // Get admin user
    const admin = await db.collection('users').findOne({ email: 'nathan254ke@gmail.com' });
    if (!admin) {
      console.error('Admin user not found!');
      process.exit(1);
    }
    
    console.log(`Admin user: ${admin.name} (${admin.email})`);
    console.log(`Admin ID: ${admin._id}`);
    
    // Update products without seller
    const result1 = await db.collection('products').updateMany(
      { seller: { $exists: false } },
      { 
        $set: { 
          seller: admin._id,
          updatedAt: new Date()
        } 
      }
    );
    
    console.log(`\n✅ Updated ${result1.modifiedCount} products without seller field`);
    
    // Update products with null seller
    const result2 = await db.collection('products').updateMany(
      { seller: null },
      { 
        $set: { 
          seller: admin._id,
          updatedAt: new Date()
        } 
      }
    );
    
    console.log(`✅ Updated ${result2.modifiedCount} products with null seller`);
    
    // Verify
    const stats = await db.collection('products').aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          withSeller: [
            { $match: { seller: { $exists: true, $ne: null } } },
            { $count: 'count' }
          ],
          adminSeller: [
            { $match: { seller: admin._id } },
            { $count: 'count' }
          ]
        }
      }
    ]).toArray();
    
    const totalCount = stats[0].total[0]?.count || 0;
    const withSellerCount = stats[0].withSeller[0]?.count || 0;
    const adminSellerCount = stats[0].adminSeller[0]?.count || 0;
    
    console.log(`\nVerification:`);
    console.log(`Total products: ${totalCount}`);
    console.log(`Products with seller: ${withSellerCount}`);
    console.log(`Products with admin as seller: ${adminSellerCount}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ Done!');
  }
}

updateSeller();

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function setDefaultSeller() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get admin user ID
    const admin = await db.collection('users').findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found!');
      process.exit(1);
    }
    
    console.log(`Admin user found: ${admin.name} (${admin.email})`);
    console.log(`Admin ID: ${admin._id}`);
    
    // Update all products without a seller
    const result = await db.collection('products').updateMany(
      { seller: { $exists: false } },
      { 
        $set: { 
          seller: admin._id,
          updatedAt: new Date()
        } 
      }
    );
    
    console.log(`\n✅ Updated ${result.modifiedCount} products to have admin as default seller`);
    
    // Also update products with null seller
    const result2 = await db.collection('products').updateMany(
      { seller: null },
      { 
        $set: { 
          seller: admin._id,
          updatedAt: new Date()
        } 
      }
    );
    
    console.log(`✅ Updated ${result2.modifiedCount} products with null seller to admin`);
    
    // Verify
    const totalWithSeller = await db.collection('products').countDocuments({ seller: { $exists: true, $ne: null } });
    const totalProducts = await db.collection('products').countDocuments({});
    
    console.log(`\nTotal products: ${totalProducts}`);
    console.log(`Products with seller: ${totalWithSeller}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Database updated successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setDefaultSeller();

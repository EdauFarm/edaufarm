const mongoose = require('mongoose');
require('dotenv').config();

async function updateProductImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const products = db.collection('products');
    
    // Nike Air Max 270 - ID: 6977cf859f7b89c1d2fd3fa8
    const nikeImages = [
      'https://i.ebayimg.com/images/g/2YwAAOSwZgRjeWCf/s-l1600.webp',
      'https://i.ebayimg.com/images/g/Ik0AAOSwWiRjeWCf/s-l960.webp',
      'https://i.ebayimg.com/images/g/~ocAAOSw14hjeWCg/s-l960.webp',
      'https://i.ebayimg.com/images/g/nVYAAOSwx4FjeWCh/s-l960.webp',
      'https://i.ebayimg.com/images/g/npAAAOSwyn9jeWCi/s-l960.webp',
      'https://i.ebayimg.com/images/g/Hu0AAOSwloxjeWCj/s-l960.webp'
    ];
    
    const nikeResult = await products.updateOne(
      { _id: new mongoose.Types.ObjectId('6977cf859f7b89c1d2fd3fa8') },
      { $set: { images: nikeImages, updatedAt: new Date() } }
    );
    
    console.log(`Nike Air Max 270: ${nikeResult.modifiedCount > 0 ? '✅ Updated' : '⚠️ No changes'}`);
    console.log(`  - ${nikeImages.length} images added\n`);
    
    // Verify the update
    const nike = await products.findOne({ _id: new mongoose.Types.ObjectId('6977cf859f7b89c1d2fd3fa8') });
    console.log('Verified Nike Air Max images:');
    nike.images.forEach((img, idx) => console.log(`  ${idx + 1}. ${img}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

updateProductImages();

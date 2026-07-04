/**
 * Script to add buyback toggle and seller info to existing products
 * This will:
 * 1. Find a default seller (admin or first seller)
 * 2. Add buybackEnabled field (default: true for electronics, false for others)
 * 3. Add seller reference to all products missing it
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function updateProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');
    const usersCollection = db.collection('users');

    // Find a default seller (admin or first seller)
    let defaultSeller = await usersCollection.findOne({ role: 'seller' });
    
    if (!defaultSeller) {
      // Try to find an admin
      defaultSeller = await usersCollection.findOne({ role: 'admin' });
    }

    if (!defaultSeller) {
      console.log('❌ No seller or admin found. Creating a default seller...');
      
      // Create a default seller
      const result = await usersCollection.insertOne({
        name: 'Jumia Official Store',
        email: 'store@jumia.co.ke',
        password: '$2a$10$dummyhash', // Placeholder - won't be used for login
        phone: '+254700000000',
        role: 'seller',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      defaultSeller = { _id: result.insertedId };
      console.log('✅ Created default seller:', defaultSeller._id);
    } else {
      console.log('✅ Found default seller:', defaultSeller.name, '(' + defaultSeller._id + ')');
    }

    // Get all products
    const products = await productsCollection.find({}).toArray();
    console.log(`\n📦 Found ${products.length} products to update\n`);

    let updatedCount = 0;

    for (const product of products) {
      const updates = {};

      // Add seller if missing
      if (!product.seller) {
        updates.seller = defaultSeller._id;
      }

      // Add buybackEnabled if missing
      if (product.buybackEnabled === undefined) {
        // Enable buyback for electronics categories by default
        const category = (product.category || '').toLowerCase();
        const isBuybackEligible = 
          category.includes('electronic') ||
          category.includes('phone') ||
          category.includes('computer') ||
          category.includes('laptop') ||
          category.includes('tablet') ||
          category.includes('camera');
        
        updates.buybackEnabled = isBuybackEligible;
      }

      // Update if there are changes
      if (Object.keys(updates).length > 0) {
        await productsCollection.updateOne(
          { _id: product._id },
          { 
            $set: {
              ...updates,
              updatedAt: new Date()
            }
          }
        );
        
        updatedCount++;
        console.log(`✅ Updated: ${product.title}`);
        console.log(`   - Seller: ${updates.seller ? '✓ Added' : '✓ Exists'}`);
        console.log(`   - Buyback: ${updates.buybackEnabled !== undefined ? (updates.buybackEnabled ? '✓ Enabled' : '✓ Disabled') : '✓ Exists'}`);
        console.log('');
      } else {
        console.log(`⏭️  Skipped: ${product.title} (already has seller and buyback fields)`);
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} products`);
    console.log(`⏭️  Skipped ${products.length - updatedCount} products (already updated)`);

    // Show summary
    const summary = await productsCollection.aggregate([
      {
        $group: {
          _id: '$buybackEnabled',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    console.log('\n📊 Buyback Summary:');
    summary.forEach(item => {
      const label = item._id === true ? 'Buyback Enabled' : 
                   item._id === false ? 'Buyback Disabled' : 'No Buyback Field';
      console.log(`   ${label}: ${item.count} products`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateProducts();

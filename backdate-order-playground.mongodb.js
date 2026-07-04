// Use this in MongoDB Playground to backdate the order

use("ecommerce");

// Calculate date 4 days ago
const fourDaysAgo = new Date();
fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

// Update the order
db.getCollection("orders").updateOne(
  { _id: ObjectId("697ecd8c5bf28eaba5d1faef") },
  { 
    $set: { 
      createdAt: fourDaysAgo,
      updatedAt: new Date()
    } 
  }
);

// Verify the update
db.getCollection("orders").findOne(
  { _id: ObjectId("697ecd8c5bf28eaba5d1faef") },
  { orderNumber: 1, createdAt: 1, status: 1, "items.title": 1 }
);

// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("ecommerce");

// Find all products with buyback enabled
db.getCollection("products").find({
  buybackEnabled: true
});

// Find all products
// db.getCollection("products").find({});

// Find a specific product by ID
// db.getCollection("products").findOne({
//   _id: ObjectId("6977cf859f7b89c1d2fd3fa8")
// });

// Count products by category
// db.getCollection("products").aggregate([
//   { $group: { _id: "$category", count: { $sum: 1 } } },
//   { $sort: { count: -1 } }
// ]);

// Find all orders
// db.getCollection("orders").find({});

// Find orders with buyback requests
// db.getCollection("orders").find({
//   "items.buybackRequested": true
// });

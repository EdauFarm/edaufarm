use("gadgetworld");

const mergedCategories = db.getCollection("products").aggregate([
  {
    $group: {
      _id: {
        $toLower: { $trim: { input: "$category" } }
      }
    }
  },
  { $sort: { _id: 1 } }
]).toArray();

mergedCategories.forEach(cat => print(cat._id));
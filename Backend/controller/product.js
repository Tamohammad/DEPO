const Product = require("../models/product.js");
const Purchase = require("../models/purchase");
const Sales = require("../models/sales");

// Add Post
// controllers/product.js

const addProduct = (req, res) => {
  console.log("req: ", req.body);

  const newProduct = new Product({
    userID: req.body.userId,
    description: req.body.description,
    count: req.body.count,
    unit: req.body.unit,
    priceperunit: req.body.priceperunit,
    totleprice: req.body.totleprice,
    category:req.body.category,
  });

  newProduct
    .save()
    .then((result) => res.status(200).send(result))
    .catch((err) => {
      console.error("❌ Error inserting product:", err);
      res.status(500).send(err);
    });
};


// Get All Products
const getAllProducts = async (req, res) => {
  const findAllProducts = await Product.find({
    userID: req.params.userId,
  }).sort({ _id: -1 }); // -1 for descending;
  res.json(findAllProducts);
};

// Delete Selected Product
const deleteSelectedProduct = async (req, res) => {
  const deleteProduct = await Product.deleteOne(
    { _id: req.params.id }
  );
  const deletePurchaseProduct = await Purchase.deleteOne(
    { ProductID: req.params.id }
  );

  const deleteSaleProduct = await Sales.deleteOne(
    { ProductID: req.params.id }
  );
  res.json({ deleteProduct, deletePurchaseProduct, deleteSaleProduct });
}
// Update Selected Product
const updateSelectedProduct = async (req, res) => {
  try {
    const updatedResult = await Product.findByIdAndUpdate(
      { _id: req.body.productID },
      {
        description: req.body.description,
        count: req.body.count,
        unit: req.body.unit,
        priceperunit: req.body.priceperunit,
        totleprice: req.body.totleprice,
        category: req.body.category, 
      },
      { new: true }
    );
    console.log(updatedResult);
    res.json(updatedResult);
  } catch (error) {
    console.log(error);
    res.status(402).send("Error");
  }
};

// Search Products
const searchProduct = async (req, res) => {
  const searchTerm = req.query.searchTerm;
  const products = await Product.find({
    description: { $regex: searchTerm, $options: "i" },
  });
  res.json(products);
};

module.exports = {
  addProduct,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
};

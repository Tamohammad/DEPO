// product.js یا هر فایل مشابه
const express = require("express");
const cors = require("cors");
const product = require("../controller/product"); // بدون .js

const app = express();

// Add Product
app.post("/add", product.addProduct);

// Get All Products
app.get("/get/:userID", product.getAllProducts);

// Delete Selected Product Item
app.get("/delete/:id", product.deleteSelectedProduct);

// Update Selected Product
app.post("/update", product.updateSelectedProduct);

// Search Product
app.get("/search", product.searchProduct);

// http://localhost:4000/api/product/search?searchTerm=fa

module.exports = app;

import express from "express";
import product from "../controller/product.js"; // ← این اجباری است
import cors from "cors"; // برای جلوگیری از مشکلات CORS
const app = express();

// Add Product
app.post("/add", product.addProduct);

// Get All Products
app.get("/get/:userId", product.getAllProducts);

// Delete Selected Product Item
app.get("/delete/:id", product.deleteSelectedProduct);

// Update Selected Product
app.post("/update", product.updateSelectedProduct);

// Search Product
app.get("/search", product.searchProduct);

// http://localhost:4000/api/product/search?searchTerm=fa

export default app;

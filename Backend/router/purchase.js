const express = require("express");
const app = express();
const purchase = require("../controller/purchase");

// Add Purchase
app.post("/add", purchase.addPurchase);

// Get All Purchase Data
app.get("/get/:userID", purchase.getPurchaseData);
//router.delete('/purchase/delete/:id', purchaseController.deletePurchase);
// فرض می‌کنیم در controller/purchase.js تابع deletePurchase وجود دارد که حذف را انجام می‌دهد

app.delete("/delete/:id", purchase.deletePurchase);


app.get("/get/:userID/totalpurchaseamount", purchase.getTotalPurchaseAmount);

module.exports = app;

// http://localhost:4000/api/purchase/add POST
// http://localhost:4000/api/purchase/get GET

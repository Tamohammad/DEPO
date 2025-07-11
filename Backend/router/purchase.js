const express = require("express");
const app = express();
const purchase = require("../controller/purchase");

// Add Purchase
app.post("/add", purchase.addPurchase);

// Get All Purchase Data
app.get("/get/:userID", purchase.getPurchaseData);

app.get("/get/:userID/totalpurchaseamount", purchase.getTotalPurchaseAmount);

// ** اضافه کردن روت ویرایش خرید **
app.put("/update/:id", purchase.updatePurchase);

// ** اضافه کردن روت حذف خرید **
// Delete Purchase by Product ID
app.delete("/delete/:id", purchase.deleteSelectedProduct);

app.get(
  "/get/:userID/totalpurchasequantity",
  purchase.getTotalPurchaseQuantity
);

module.exports = app;

// http://localhost:4000/api/purchase/add POST
// http://localhost:4000/api/purchase/get GET

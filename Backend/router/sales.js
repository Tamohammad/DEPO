const express = require("express");
const app = express();
const sales = require("../controller/sales");

// Add Sales
app.post("/add", sales.addSales);

// Get All Sales
app.get("/get/:userID", sales.getSalesData);

// Delete Selected Product Item
app.delete("/deletesale/:id", sales.deleteSaleById);

// Update Selected Product
app.put("/update/:id", sales.updateSelectedProduct);

app.get("/get/:userID/totalsaleamount", sales.getTotalSalesAmount);
/////////////////////////////////////////////////////////////////////////////
// ✅ Get Monthly Sales Stats for Bar Chart
app.get("/getmonthly/:userID", sales.getMonthlySalesStats);
// ✅ Get Total Sale Amount for a Specific Year (Shamsi)
app.get("/get/:userID/monthlysaleamount", sales.getMonthlySaleAmountCurrent);
// Get Unique Departments from Sales
app.get("/departments", sales.getDepartments);

module.exports = app;

// http://localhost:4000/api/sales/add POST
// http://localhost:4000/api/sales/get GET

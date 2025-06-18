const Sales = require("../models/sales");
const soldStock = require("../controller/soldStock");


const addSales = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const newSale = new Sales({
      userID: req.body.userID,
      distributedNumber: req.body.distributedNumber, // ✅ اصلاح spelling
      category: req.body.category,
      productID: req.body.productID && req.body.productID.length === 24 ? req.body.productID : undefined, // ✅ شرط گذاشتن برای مقدار معتبر
      stockSold: req.body.stockSold,
      unit: req.body.unit,
      saleAmount: req.body.saleAmount,
      totalSaleAmount: req.body.totalSaleAmount,
      department: req.body.department,
      saleDate: new Date(req.body.saleDate),
      description: req.body.description,
    });

    const result = await newSale.save();

    // فقط اگر productID معتبر داشت، برو soldStock اجرا کن
    if (req.body.productID && req.body.productID.length === 24) {
      await soldStock(req.body.productID, req.body.stockSold);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error saving sale:", err);
    res.status(500).json({ error: err.message });
  }
};

const getSalesData = async (req, res) => {
  try {
    console.log("Request to get sales for user:", req.params.userID);
    const sales = await Sales.find({ userID: req.params.userID })
      .sort({ _id: -1 })
      .populate("ProductID");

    console.log("Found sales:", sales.length);
    res.json(sales);
  } catch (err) {
    console.error("Error in getSalesData:", err);
    res.status(500).json({ error: err.message });
  }
};

const getTotalSalesAmount = async (req, res) => {
  try {
    console.log("Calculating total sales for user:", req.params.userID);
    const salesData = await Sales.find({ userID: req.params.userID });

    let total = 0;
    salesData.forEach((sale) => {
      console.log("Sale amount:", sale.totalSaleAmount);
      total += sale.totalSaleAmount;
    });

    res.json({ totalSaleAmount: total });
  } catch (err) {
    console.error("Error in getTotalSalesAmount:", err);
    res.status(500).json({ error: err.message });
  }
};




module.exports = { addSales, getSalesData,  getTotalSalesAmount};

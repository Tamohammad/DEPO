
const Sales = require("../models/sales");
const Product = require("../models/product");
const Purchase = require("../models/purchase");
const soldStock = require("../controller/soldStock");

// Add a new sale
const addSales = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const {
      userID,
      distributedNumber,
      category,
      productID,
      stockSold,
      unit,
      saleAmount,
      totalSaleAmount,
      department,
      saleDate,
      description,
    } = req.body;

    const isValidProductID = productID && productID.length === 24;

    let stockResult = null;

    // ✅ مرحله اول: بررسی موجودی
    if (isValidProductID) {
      stockResult = await soldStock(productID, stockSold); // اینجا اگر موجودی کافی نباشه، throw میشه و ادامه اجرا نمیشه
    }

    // ✅ مرحله دوم: ثبت توزیع فقط اگر موجودی کافی بود
    const newSale = new Sales({
      userID,
      distributedNumber,
      category,
      productID: isValidProductID ? productID : undefined,
      stockSold,
      unit,
      saleAmount,
      totalSaleAmount,
      department,
      saleDate: new Date(saleDate),
      description,
    });

    const result = await newSale.save();

    // ✅ مرحله سوم: پاسخ به فرانت‌اند
    res.status(200).json({
      message: "✅ توزیع با موفقیت ثبت شد.",
      sale: result,
      inventory: stockResult,
    });

  } catch (err) {
    console.error("❌ Error saving sale:", err);
    res.status(500).json({ error: err.message });
  }
};


// Get sales data by userID
const getSalesData = async (req, res) => {
  try {
    console.log("Request to get sales for user:", req.params.userID);
    const sales = await Sales.find({ userID: req.params.userID })
      .sort({ _id: -1 })
      .populate("productID");

    console.log("Found sales:", sales.length);
    res.json(sales);
  } catch (err) {
    console.error("Error in getSalesData:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get total sales amount for a user
const getTotalSalesAmount = async (req, res) => {
  try {
    console.log("Calculating total sales for user:", req.params.userID);
    const salesData = await Sales.find({ userID: req.params.userID });

    const total = salesData.reduce((acc, sale) => acc + sale.totalSaleAmount, 0);

    res.json({ totalSaleAmount: total });
  } catch (err) {
    console.error("Error in getTotalSalesAmount:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete product and associated purchase/sales



const deleteSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    // بررسی اولیه‌ی وجود id
    if (!id || id.trim() === "") {
      return res.status(400).json({ message: "شناسه‌ی فروش الزامی است" });
    }

    // بررسی اعتبار شناسه MongoDB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "شناسه فروش نامعتبر است" });
    }

    // تلاش برای حذف فروش با id مشخص‌شده
    const deleted = await Sales.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "فروش پیدا نشد" });
    }

    // حذف موفقیت‌آمیز
    return res.status(200).json({ message: "فروش با موفقیت حذف شد" });

  } catch (err) {
    console.error("خطا در حذف فروش:", err.message);
    return res.status(500).json({ error: "خطای سرور. لطفاً دوباره تلاش کنید." });
  }
};

// Update product
const updateSelectedProduct = async (req, res) => {
  try {
    const {
      _id,
      userID,
      distributedNumber,
      category,
      productID,
      stockSold,
      unit,
      saleAmount,
      totalSaleAmount,
      department,
      saleDate,
      description,
    } = req.body;

    const isValidProductID = productID && productID.length === 24;

    const updatedResult = await Sales.findByIdAndUpdate(
      _id,
      {
        userID,
        distributedNumber,
        category,
        productID: isValidProductID ? productID : undefined,
        stockSold,
        unit,
        saleAmount,
        totalSaleAmount,
        department,
        saleDate: new Date(saleDate),
        description,
      },
      { new: true }
    );

    res.json(updatedResult);
  } catch (error) {
    console.error("Error in updateSelectedProduct:", error);
    res.status(500).send("Error updating sale");
  }
};


// Search sales by description
const searchSales = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const sales = await Sales.find({
      description: { $regex: searchTerm, $options: "i" },
    });
    res.json(sales);
  } catch (err) {
    console.error("Error in searchSales:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addSales,
  getSalesData,
  getTotalSalesAmount,
  deleteSaleById,
  updateSelectedProduct,
  searchSales,
};

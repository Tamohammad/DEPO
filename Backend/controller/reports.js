const Sale = require("../models/Sale");
const Purchase = require("../models/purchase");

exports.getReportSummary = async (req, res) => {
  const userId = req.params.userId;
  try {
    // آمار خریدها
    const purchaseStats = await Purchase.aggregate([
      { $match: { userID: userId } },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          totalPurchaseAmount: { $sum: "$totalPurchaseAmount" },
          totalQuantityPurchased: { $sum: "$quantityPurchased" }
        }
      }
    ]);

    // آمار فروش‌ها (مثلاً با فیلدهای خودت)
   const saleStats = await Sale.aggregate([
  { $match: { userID: mongoose.Types.ObjectId(userId) } },
  {
    $group: {
      _id: null,
      totalSales: { $sum: 1 },
      totalSaleAmount: { $sum: "$TotalSaleAmount" }, // ✅ تصحیح شد
      totalQuantitySold: { $sum: "$StockSold" }      // ✅ درست است
    }
  }
]);


    res.json({
      purchaseStats: purchaseStats[0] || { totalPurchases: 0, totalPurchaseAmount: 0, totalQuantityPurchased: 0 },
      saleStats: saleStats[0] || { totalSales: 0, totalSaleAmount: 0, totalQuantitySold: 0 }
    });
  } catch (err) {
    console.error(err);
    console.error("خطای گزارش:", err);
    res.status(500).json({ message: "خطا در دریافت گزارش" });
  }
};

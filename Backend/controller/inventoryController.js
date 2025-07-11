const Inventory = require("../models/Inventory");
const Purchase = require("../models/purchase");
const Sales = require("../models/sales");

exports.getAllInventory = async (req, res) => {
  try {
    // گرفتن همه اقلام از Inventory
    const items = await Inventory.find({});

    // مجموع خریدها گروه‌بندی‌شده بر اساس productID
    const purchasesAgg = await Purchase.aggregate([
      {
        $group: {
          _id: "$productID",
          totalPurchases: { $sum: "$quantityPurchased" },
        },
      },
    ]);

    // مجموع فروش‌ها گروه‌بندی‌شده بر اساس productID
    const salesAgg = await Sales.aggregate([
      {
        $group: {
          _id: "$productID",
          totalSales: { $sum: "$stockSold" },
        },
      },
    ]);

    // ساخت Map برای خرید و فروش‌ها
    const purchaseMap = {};
    purchasesAgg.forEach((p) => {
      purchaseMap[p._id] = p.totalPurchases;
    });

    const salesMap = {};
    salesAgg.forEach((s) => {
      salesMap[s._id] = s.totalSales;
    });

    // ترکیب اطلاعات با موجودی‌ها
    const inventoryWithTotals = items.map((item) => {
      const productId = item._id.toString();
      const totalPurchases = purchaseMap[productId] || 0;
      const totalSales = salesMap[productId] || 0;
      const remaining = totalPurchases - totalSales;

      return {
        ...item.toObject(),
        totalPurchases,
        totalSales,
        remaining,
      };
    });

    res.json(inventoryWithTotals);
  } catch (err) {
    console.error("❌ خطا در دریافت موجودی:", err);
    res.status(500).json({ message: "خطا در دریافت موجودی" });
  }
};

// routes/inventory.js
const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory.js");
/////
const Product = require("../models/product");
const inventoryController = require("../controller/inventoryController");

// مثال: گرفتن همه موجودی‌ها
router.get("/", async (req, res) => {
  try {
    const allInventory = await Inventory.find().sort({ _id: -1 });
    res.status(200).json(allInventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// const express = require("express");
// const router = express.Router();
// const Product = require("../models/product");
// const Inventory = require("../models/Inventory.js");
// const inventoryController = require("../controller/inventoryController");

router.get("/all", async (req, res) => {
  try {
    const allItems = await Product.find({});
    res.json(allItems);
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ message: "خطا در دریافت تمام اجناس" });
  }
});

// گرفتن تمام موجودی‌ها از Inventory
router.get("/", async (req, res) => {
  try {
    const allInventory = await Inventory.find().sort({ _id: -1 });
    res.status(200).json(allInventory);
  } catch (err) {
    console.error("خطا در دریافت موجودی‌ها:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const allItems = await Product.find({});
    res.json(allItems);
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ message: "خطا در دریافت تمام اجناس" });
  }
});

//////////////////////////////////////////////////////
// ✅ گرفتن موجودی فقط برای یک یوزر خاص
router.get("/get/:userID", async (req, res) => {
  const { userID } = req.params;

  try {
    const userInventory = await Inventory.find({ userID }).sort({ _id: -1 });
    res.status(200).json(userInventory);
  } catch (err) {
    res.status(500).json({ error: "خطا در دریافت موجودی" });
  }
});

// (اختیاری) گرفتن همه موجودی‌ها — فقط برای مدیر یا تست
router.get("/", async (req, res) => {
  try {
    const allInventory = await Inventory.find().sort({ _id: -1 });
    res.status(200).json(allInventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//////////////////////////////////////////////////////////////
// ✅ گرفتن آمار موجودی بر اساس دسته‌بندی برای یک یوزر خاص
const mongoose = require("mongoose");
router.get("/categorystats/:userID", async (req, res) => {
  const { userID } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ error: "شناسه کاربر نامعتبر است" });
    }

    const matchUserId = new mongoose.Types.ObjectId(userID); // ✅ اصلاح شده

    const stats = await Inventory.aggregate([
      { $match: { userID: matchUserId } },
      {
        $group: {
          _id: "$category",
          count: { $sum: "$totalCount" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
        },
      },
    ]);

    const allCategories = [
      "قرطاسیه",
      "اجناس دفتری",
      "تجهیزات آی تی",
      "اجناس حفظ و مراقبت",
      "روغنیات",
    ];

    const result = allCategories.map((cat) => {
      const found = stats.find((s) => s.category === cat);
      return {
        category: cat,
        count: found ? found.count : 0,
      };
    });

    res.status(200).json({
      labels: result.map((r) => r.category),
      counts: result.map((r) => r.count),
    });
  } catch (err) {
    console.error("❌ خطا:", err);
    res.status(500).json({ error: "خطا در دریافت آمار کتگوری" });
  }
});

module.exports = router;

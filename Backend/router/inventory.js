// routes/inventory.js
const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory.js");

// مثال: گرفتن همه موجودی‌ها
router.get("/", async (req, res) => {
  try {
    const allInventory = await Inventory.find().sort({ _id: -1 });
    res.status(200).json(allInventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

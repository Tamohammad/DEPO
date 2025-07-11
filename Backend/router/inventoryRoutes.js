const express = require("express");
const router = express.Router();
const inventoryController = require("../controller/inventoryController");

// تعریف روت برای گرفتن تمام اجناس
router.get("/all", inventoryController.getAllInventory);

module.exports = router;

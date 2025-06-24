
const Inventory = require("../models/Inventory");

const soldStock = async (productId, stockSold) => {
  // پیدا کردن موجودی کالا
  const inventoryItem = await Inventory.findOne({ productId });

  if (!inventoryItem) {
    throw new Error("❌ محصول مورد نظر در موجودی یافت نشد.");
  }

  // بررسی موجودی کافی
  if (inventoryItem.totalCount < stockSold) {
    throw new Error(`❌ موجودی کافی نیست. فقط ${inventoryItem.totalCount} عدد موجود است.`);
  }

  // کم کردن موجودی
  inventoryItem.totalCount -= stockSold;
  await inventoryItem.save();

  // ✅ بازگرداندن اطلاعات نهایی
  return {
    message: "✅ توزیع با موفقیت انجام شد.",
    remainingStock: inventoryItem.totalCount,
    productId: inventoryItem.productId,
    name: inventoryItem.name,
    unit: inventoryItem.unit,
    category: inventoryItem.category,
  };
};

module.exports = soldStock;

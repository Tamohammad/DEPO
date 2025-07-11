const Purchase = require("../models/purchase");
const Product = require("../models/product");
const Sales = require("../models/sales");
const purchaseStock = require("./purchaseStock");
const mongoose = require("mongoose");
const moment = require("moment-jalaali");

//...

const addPurchase = async (req, res) => {
  try {
    const {
      userID,
      productID,
      category,
      quantityPurchased,
      unit,
      pricePerUnit,
      totalPurchaseAmount,
      purchaseDate,
      purchaseDateShamsi,
    } = req.body;

    const purchaseDateMiladi = purchaseDate
      ? moment(purchaseDate, "jYYYY/jMM/jDD").toDate()
      : new Date();

    if (!userID || !productID || !quantityPurchased || !pricePerUnit) {
      return res.status(400).json({ message: "فیلدهای ضروری وارد نشده‌اند." });
    }
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ message: "شناسه کاربر معتبر نیست." });
    }

    const newPurchase = new Purchase({
      userID: new mongoose.Types.ObjectId(userID),
      productID,
      category,
      quantityPurchased: Number(quantityPurchased),
      unit,
      pricePerUnit: Number(pricePerUnit),
      totalPurchaseAmount: Number(totalPurchaseAmount),
      purchaseDate: purchaseDateMiladi,
      purchaseDateShamsi,
    });

    const result = await newPurchase.save();

    return res.json(result);
  } catch (error) {
    console.error("خطا در ثبت اجناس اعاده:", error);
    return res.status(500).json({ message: "خطا در ثبت اجناس اعاره." });
  }
};

const getPurchaseData = async (req, res) => {
  try {
    const userID = req.params.userID;
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ message: "شناسه کاربر معتبر نیست." });
    }

    const purchases = await Purchase.find({
      userID: new mongoose.Types.ObjectId(userID),
    });
    return res.json(purchases);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "خطا در دریافت اعاده ها." });
  }
};

const getTotalPurchaseAmount = async (req, res) => {
  try {
    const userID = req.params.userID;
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ message: "شناسه کاربر معتبر نیست." });
    }

    const purchases = await Purchase.find({
      userID: new mongoose.Types.ObjectId(userID),
    });
    const total = purchases.reduce((acc, p) => acc + p.totalPurchaseAmount, 0);

    return res.json({ totalPurchaseAmount: total });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "خطا در محاسبه مجموع جنس اعاده شده" });
  }
};

const deleteSelectedProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPurchase = await Purchase.findByIdAndDelete(id);

    if (!deletedPurchase) {
      return res
        .status(404)
        .json({ message: "جنس اعاوه شده با این آیدی پیدا نشد." });
    }

    return res.json({
      message: "جنس اعاده شده با موفقیت حذف شد.",
      deletedPurchase,
    });
  } catch (error) {
    console.error("خطا در حذف جنس اعاده", error);
    res.status(500).json({ message: "خطا در حذف جنس اعاده." });
  }
};

const updatePurchase = async (req, res) => {
  try {
    const purchaseId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
      return res.status(400).json({ message: "شناسه جنس اعاده معتبر نیست." });
    }

    const { purchaseDate, purchaseDateShamsi, ...restData } = req.body;

    const formattedDate = purchaseDate
      ? moment(purchaseDate, "jYYYY/jMM/jDD").toDate()
      : new Date();

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      {
        ...restData,
        purchaseDate: formattedDate,
        purchaseDateShamsi,
      },
      { new: true }
    );

    if (!updatedPurchase) {
      return res.status(404).json({ message: "جنس اعاده یافت نشد" });
    }

    return res.json(updatedPurchase);
  } catch (error) {
    console.error("خطا در بروزرسانی جنس اعاده", error);
    return res.status(500).json({ message: "خطا در بروزرسانی جنس اعاده." });
  }
};

const deletePurchase = async (req, res) => {
  try {
    const purchaseId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
      return res.status(400).json({ message: "شناسه اعاده معتبر نیست." });
    }

    const deletedPurchase = await Purchase.findByIdAndDelete(purchaseId);
    if (!deletedPurchase) {
      return res.status(404).json({ message: "جنس اعاده یافت نشد" });
    }

    return res.json({ message: " جنس اعاده حذف شد.", deletedPurchase });
  } catch (error) {
    console.error("خطا در حذف جنس اعاده", error);
    return res.status(500).json({ message: "خطا در حذف جنس اعاده" });
  }
};

const getTotalPurchaseQuantity = async (req, res) => {
  try {
    const userID = req.params.userID;
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ message: "شناسه کاربر معتبر نیست." });
    }

    const result = await Purchase.aggregate([
      { $match: { userID: new mongoose.Types.ObjectId(userID) } },
      { $group: { _id: null, totalQuantity: { $sum: "$quantityPurchased" } } },
    ]);

    const totalQuantity = result[0]?.totalQuantity || 0;
    return res.json({ totalPurchaseQuantity: totalQuantity });
  } catch (err) {
    console.error("خطا در محاسبه مجموع تعداد اجناس اعاده", err);
    return res
      .status(500)
      .json({ message: "خطا در دریافت مجموع تعداد اجناس اعاده." });
  }
};

module.exports = {
  addPurchase,
  getPurchaseData,
  getTotalPurchaseAmount,
  updatePurchase,
  deleteSelectedProduct,
  deletePurchase,
  getTotalPurchaseQuantity,
};

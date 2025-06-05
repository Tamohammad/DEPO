const Purchase = require("../models/purchase");
const Product = require("../models/product"); // اضافه شده
const Sales = require("../models/sales");     // اضافه شده
const purchaseStock = require("./purchaseStock");

// Add Purchase Details
const addPurchase = (req, res) => {
  const {
    userID,
    productID,
    category,
    quantityPurchased,
    pricePerUnit,
    unit,
    purchaseDate,
    totalPurchaseAmount,
  } = req.body;

  const addPurchaseDetails = new Purchase({
    userID,
    productID,
    category,
    quantityPurchased: Number(quantityPurchased),
    pricePerUnit: Number(pricePerUnit),
    unit,
    purchaseDate,
    totalPurchaseAmount: Number(totalPurchaseAmount),
  });

  addPurchaseDetails
    .save()
    .then((result) => {
      purchaseStock(productID, Number(quantityPurchased));
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
};

// Get All Purchase Data
const getPurchaseData = async (req, res) => {
  try {
    const purchases = await Purchase.find({ userID: req.params.userID });
    res.json(purchases);
  } catch (err) {
    res.status(500).send(err);
  }
};

// Get total purchase amount
const getTotalPurchaseAmount = async (req, res) => {
  try {
    const purchases = await Purchase.find({ userID: req.params.userID });
    const total = purchases.reduce((acc, p) => acc + p.totalPurchaseAmount, 0);
    res.json({ totalPurchaseAmount: total });
  } catch (err) {
    res.status(500).send(err);
  }
};

// Delete Selected Product
const deleteSelectedProduct = async (req, res) => {
  try {
    const deleteProduct = await Product.deleteOne({ _id: req.params.id });
    const deletePurchaseProduct = await Purchase.deleteMany({ productID: req.params.id });
    const deleteSaleProduct = await Sales.deleteMany({ productID: req.params.id });

    res.json({ deleteProduct, deletePurchaseProduct, deleteSaleProduct });
  } catch (err) {
    res.status(500).send(err);
  }
};

// Update Selected Product
const updateSelectedProduct = async (req, res) => {
  try {
    const updatedResult = await Product.findByIdAndUpdate(
      req.body.productID,
      {
        name: req.body.name,
        manufacturer: req.body.manufacturer,
        description: req.body.description,
      },
      { new: true }
    );
    console.log(updatedResult);
    res.json(updatedResult);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Error updating product");
  }
};

// متد حذف خرید با آیدی
const deletePurchase = async (req, res) => {
  try {
    const purchaseId = req.params.id;
    const deletedPurchase = await Purchase.findByIdAndDelete(purchaseId);

    if (!deletedPurchase) {
      return res.status(404).json({ message: "خرید مورد نظر یافت نشد" });
    }

    res.json({ message: "خرید حذف شد", deletedPurchase });
  } catch (error) {
    console.error("Error deleting purchase:", error);
    res.status(500).json({ message: "خطا در حذف خرید" });
  }
};





// ✅ Export all functions
module.exports = {
  addPurchase,
  getPurchaseData,
  getTotalPurchaseAmount,
  updateSelectedProduct,
  deleteSelectedProduct,
  deletePurchase,
};

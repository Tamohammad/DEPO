const Product = require("../models/product.js");
const Purchase = require("../models/purchase");
const Sales = require("../models/sales");
// controller
const addProduct = async (req, res) => {
  try {
    console.log("Received product data:", req.body);

    const {
      userId,
      ticketserialnumber,
      date,
      name,
      description,
      count,
      unit,
      priceperunit,
      totalPrice,
      category,
    } = req.body;

    if (
      !userId ||
      !ticketserialnumber ||
      !name ||
      !description ||
      !unit ||
      !category
    ) {
      return res.status(400).json({
        message: "⚠ لطفاً تمام فیلدهای الزامی را وارد کنید.",
      });
    }

    const parsedTicket = Number(ticketserialnumber);
    const parsedPrice = Number(priceperunit);
    const parsedCount = Number(count);

    if (isNaN(parsedTicket) || isNaN(parsedPrice) || isNaN(parsedCount)) {
      return res.status(400).json({
        message: "⚠ فیلدهای عددی باید عدد معتبر باشند.",
      });
    }

    const finalTotalPrice =
      totalPrice ??
      (parsedPrice && parsedCount ? parsedPrice * parsedCount : 0);
    const today = new Date().toISOString().split("T")[0];

    const newProduct = new Product({
      userId,
      ticketserialnumber: parsedTicket,
      date: today,
      name: name.trim(),
      description: description.trim(),
      count: parsedCount,
      unit: unit.trim(),
      priceperunit: parsedPrice,
      totalPrice: finalTotalPrice,
      category: category.trim(),
    });

    const saved = await newProduct.save();

    return res.status(201).json({
      message: "✅ جنس جدید با موفقیت اضافه شد.",
      product: saved,
    });
  } catch (error) {
    console.error("Full error in addProduct:", error);
    return res.status(500).json({
      message: "⚠ خطای سرور در ذخیره‌سازی محصول.",
      error: error.message,
    });
  }
};

module.exports = { addProduct };

const getAllProducts = async (req, res) => {
  try {
    const findAllProducts = await Product.find({
      userId: req.params.userId,
    }).sort({ _id: -1 });

    res.json(findAllProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "خطا در دریافت محصولات" });
  }
};

const deleteSelectedProduct = async (req, res) => {
  // باید این توابع را از مدل‌ها import کنی یا به صورت Product.deleteOne و غیره استفاده کنی
  const deleteProduct = await Product.deleteOne({ _id: req.params.id });
  // مشابه برای purchase و sales:
  const deletePurchaseProduct = await Purchase.deleteOne({
    ProductID: req.params.id,
  });
  const deleteSaleProduct = await Sales.deleteOne({ ProductID: req.params.id });

  res.json({ deleteProduct, deletePurchaseProduct, deleteSaleProduct });
};

const updateSelectedProduct = async (req, res) => {
  try {
    const updatedResult = await Product.findByIdAndUpdate(
      req.body.productID,
      {
        ticketserialnumber: req.body.ticketserialnumber,
        date: req.body.date,
        description: req.body.description,
        name: req.body.name,
        count: req.body.count,
        unit: req.body.unit,
        priceperunit: req.body.priceperunit,
        totleprice: req.body.totleprice,
        category: req.body.category,
      },
      { new: true }
    );
    console.log(updatedResult);
    res.json(updatedResult);
  } catch (error) {
    console.log(error);
    res.status(402).send("Error");
  }
};

const searchProduct = async (req, res) => {
  const searchTerm = req.query.searchTerm;
  const products = await Product.find({
    description: { $regex: searchTerm, $options: "i" },
  });
  res.json(products);
};

module.exports = {
  addProduct,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
};

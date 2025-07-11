const Product = require("../models/product.js");
const Purchase = require("../models/purchase");
const Sales = require("../models/sales");
const Inventory = require("../models/Inventory");
const persianTools = require("persian-tools2");
const moment = require("moment-jalaali");
moment.loadPersian({ dialect: "persian-modern", usePersianDigits: true });
// controller
const addProduct = async (req, res) => {
  try {
    console.log("Received product data:", req.body);

    const {
      userID,
      ticketserialnumber,
      date,
      ProductDateShamsi, // تاریخ شمسی برای نمایش
      name,
      description,
      count,
      unit,
      priceperunit,
      totalPrice,
      category,
    } = req.body;

    const productDateMiladi = date
      ? moment(date, "jYYYY/jMM/jDD").toDate()
      : new Date();

    if (
      !userID ||
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

    const newProduct = new Product({
      userID,
      ticketserialnumber: parsedTicket,
      date: productDateMiladi, // تاریخ میلادی برای کوئری‌ها
      ProductDateShamsi,
      name: name.trim(),
      description: description.trim(),
      count: parsedCount,
      unit: unit.trim(),
      priceperunit: parsedPrice,
      totalPrice: finalTotalPrice,
      category: category.trim(),
    });

    const saved = await newProduct.save();
    ////////////////////////////////////////////////////////
    const existingInventory = await Inventory.findOne({
      name: saved.name,
      unit: saved.unit,
      category: saved.category,
      userID: userID,
    });

    if (existingInventory) {
      // اگر کالا قبلاً موجود است، تعداد را افزایش بده
      existingInventory.totalCount += parsedCount;
      await existingInventory.save();
    } else {
      // در غیر این صورت، یک رکورد جدید برای موجودی بساز
      await Inventory.create({
        productId: saved._id,
        name: saved.name,
        unit: saved.unit,
        category: saved.category,
        totalCount: parsedCount,
        userID: userID,
      });
    }

    ////////////////////////////////////////////////////////////////////
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
      userID: req.params.userID,
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
    const {
      productID,
      ticketserialnumber,
      date,
      ProductDateShamsi,
      description,
      name,
      count,
      unit,
      priceperunit,
      totalPrice,
      category,
    } = req.body;

    const productDateMiladi = date
      ? moment(date, "jYYYY/jMM/jDD").toDate()
      : new Date();

    const updatedResult = await Product.findByIdAndUpdate(
      productID,
      {
        ticketserialnumber,
        date: productDateMiladi, // تاریخ میلادی برای کوئری‌ها
        ProductDateShamsi, // تاریخ شمسی برای نمایش
        description,
        name,
        count,
        unit,
        priceperunit,
        totalPrice,
        category,
      },
      { new: true }
    );
    console.log(updatedResult);
    res.json(updatedResult);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating product");
  }
};

// search product code
const searchProduct = async (req, res) => {
  const searchTerm = req.query.searchTerm;

  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ],
    });

    res.json(products);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "خطا در جستجوی محصولات" });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
};

<<<<<<< HEAD

const Product = require("../models/Product.js");
const Purchase = require("../models/purchase");
const Sales = require("../models/sales");

=======
const Product = require("../models/Product.js");
const Purchase = require("../models/purchase");
const Sales = require("../models/sales");
>>>>>>> 4c25d1842245c9281baca76089ff221def0bf020

const addProduct = async (req, res) => {
  try {
    const {
      userId,
      ticketserialnumber,
      date,
      name,
      description,
      count,
      unit,
      priceperunit,
      category,
    } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "⚠️ شناسه کاربر ارسال نشده است." });
    }

    const parsedCount = parseFloat(count);
    const parsedPrice = parseFloat(priceperunit);
    const parsedTicketSerialNumber = parseInt(ticketserialnumber, 10);

    if (
      isNaN(parsedCount) ||
      isNaN(parsedPrice) ||
      isNaN(parsedTicketSerialNumber)
    ) {
      return res
        .status(400)
        .json({ message: "⚠️ تعداد، قیمت یا شماره سریال معتبر نیست." });
    }

    const existingProduct = await Product.findOne({
      userId,
      name: name.trim(), // ✅ ذخیره در سطح بالا
      description: new RegExp(`^${description.trim()}$`, "i"),
      unit: unit.trim(),
      category: category.trim(),
    });

    if (existingProduct) {
      existingProduct.entries.push({
        name: name.trim(), // ✅ ذخیره در سطح بالا
        count: parsedCount,
        price: parsedPrice,
        date: date ? new Date(date) : new Date(),
      });

      const total = existingProduct.entries.reduce(
        (acc, entry) => {
          const c = parseFloat(entry.count);
          const p = parseFloat(entry.price);
          if (!isNaN(c) && !isNaN(p)) {
            acc.count += c;
            acc.totalPrice += c * p;
          }
          return acc;
        },
        { count: 0, totalPrice: 0 }
      );

      existingProduct.count = total.count;
      existingProduct.totleprice = total.totalPrice;
      existingProduct.priceperunit = parsedPrice;

      const updated = await existingProduct.save();

      return res.status(200).json({
        message: "🔁 جنس موجود بود و بروزرسانی شد.",
        product: updated,
      });
    } else {
      const newProduct = new Product({
        userId,
        name: name.trim(), // ✅ ذخیره در سطح بالا
        description: description.trim(),
        unit: unit.trim(),
        category: category.trim(),
        entries: [
          {
            ticketserialnumber: parsedTicketSerialNumber,
            count: parsedCount,
            price: parsedPrice,
            date: date ? new Date(date) : new Date(),
          },
        ],
        count: parsedCount,
        totleprice: parsedCount * parsedPrice,
        priceperunit: parsedPrice,
      });

      const saved = await newProduct.save();

      return res.status(201).json({
        message: "✅ جنس جدید اضافه شد.",
        product: saved,
      });
    }
  } catch (error) {
    console.error("❌ خطا در افزودن/بروزرسانی جنس:", error);
    return res.status(500).json({ message: "⚠️ خطای سرور", error });
  }
};

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

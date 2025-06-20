import Product from "../models/Product.js"; // مطمئن شو این خط وجود دارد

const addProduct = async (req, res) => {
  try {
    const {
      userId,
      ticketserialnumber,
      date,
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
      ticketserialnumber: parsedTicketSerialNumber,
      description: new RegExp(`^${description.trim()}$`, "i"),
      unit: unit.trim(),
      category: category.trim(),
    });

    if (existingProduct) {
      existingProduct.entries.push({
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
        ticketserialnumber: parsedTicketSerialNumber,
        description: description.trim(),
        unit: unit.trim(),
        category: category.trim(),
        entries: [
          {
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

// get allproduct
const getAllProducts = async (req, res) => {
  try {
    const findAllProducts = await Product.find({
      userId: req.params.userId, // دقت کن که کلید userId کوچیک نوشته شده باشه
    }).sort({ _id: -1 }); // مرتب‌سازی نزولی

    res.json(findAllProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "خطا در دریافت محصولات" });
  }
};

// Delete Selected Product
const deleteSelectedProduct = async (req, res) => {
  const deleteProduct = await deleteOne({ _id: req.params.id });
  const deletePurchaseProduct = await _deleteOne({
    ProductID: req.params.id,
  });

  const deleteSaleProduct = await __deleteOne({ ProductID: req.params.id });
  res.json({ deleteProduct, deletePurchaseProduct, deleteSaleProduct });
};
// Update Selected Product
const updateSelectedProduct = async (req, res) => {
  try {
    const updatedResult = await findByIdAndUpdate(
      { _id: req.body.productID },
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

// Search Products
const searchProduct = async (req, res) => {
  const searchTerm = req.query.searchTerm;
  const products = await find({
    description: { $regex: searchTerm, $options: "i" },
  });
  res.json(products);
};

export default {
  addProduct,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
};

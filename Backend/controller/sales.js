const Sales = require("../models/sales");
const Product = require("../models/product");
const Purchase = require("../models/purchase");
const soldStock = require("../controller/soldStock");
const Inventory = require("../models/Inventory");
const moment = require("moment-jalaali");

// Add a new sale
const addSales = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const {
      userID,
      distributedNumber,
      category,
      productID,
      stockSold,
      unit,
      saleAmount,
      totalSaleAmount,
      department,
      saleDate, // شمسی به صورت رشته
      description,
    } = req.body;

    const isValidProductID = productID && productID.length === 24;

    let stockResult = null;
    const saleDateMiladi = saleDate
      ? moment(saleDate, "jYYYY/jMM/jDD").toDate()
      : null;

    // ✅ مرحله اول: بررسی موجودی
    if (isValidProductID) {
      stockResult = await soldStock(productID, stockSold, userID); // اینجا اگر موجودی کافی نباشه، throw میشه و ادامه اجرا نمیشه
    }

    // ✅ مرحله دوم: ثبت توزیع فقط اگر موجودی کافی بود
    const newSale = new Sales({
      userID,
      distributedNumber,
      category,
      productID: isValidProductID ? productID : undefined,
      stockSold,
      unit,
      saleAmount,
      totalSaleAmount,
      department,
      saleDate: saleDateMiladi, // تاریخ میلادی برای کوئری‌ها
      saleDateShamsi: saleDate, // تاریخ شمسی برای نمایش
      description,
    });

    const result = await newSale.save();

    // ✅ مرحله سوم: پاسخ به فرانت‌اند
    res.status(200).json({
      message: "✅ توزیع با موفقیت ثبت شد.",
      sale: result,
      inventory: stockResult,
    });
  } catch (err) {
    console.error("❌ Error saving sale:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get sales data by userID
const getSalesData = async (req, res) => {
  try {
    console.log("Request to get sales for user:", req.params.userID);
    const sales = await Sales.find({ userID: req.params.userID })
      .sort({ _id: -1 })
      .populate("productID");

    console.log("Found sales:", sales.length);
    res.json(sales);
  } catch (err) {
    console.error("Error in getSalesData:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get total sales amount for a user
const getTotalSalesAmount = async (req, res) => {
  try {
    console.log("Calculating total sales for user:", req.params.userID);
    const salesData = await Sales.find({ userID: req.params.userID });

    const total = salesData.reduce(
      (acc, sale) => acc + sale.totalSaleAmount,
      0
    );

    res.json({ totalSaleAmount: total });
  } catch (err) {
    console.error("Error in getTotalSalesAmount:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete product and associated purchase/sales

const deleteSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    // بررسی اولیه‌ی وجود id
    if (!id || id.trim() === "") {
      return res.status(400).json({ message: "شناسه‌ی فروش الزامی است" });
    }

    // بررسی اعتبار شناسه MongoDB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "شناسه فروش نامعتبر است" });
    }

    // تلاش برای حذف فروش با id مشخص‌شده
    const deleted = await Sales.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "فروش پیدا نشد" });
    }

    // حذف موفقیت‌آمیز
    return res.status(200).json({ message: "فروش با موفقیت حذف شد" });
  } catch (err) {
    console.error("خطا در حذف فروش:", err.message);
    return res
      .status(500)
      .json({ error: "خطای سرور. لطفاً دوباره تلاش کنید." });
  }
};
////////////////////////////////////////////////
// Update product
const updateSelectedProduct = async (req, res) => {
  try {
    const {
      _id,
      userID,
      distributedNumber,
      category,
      productID,
      stockSold,
      unit,
      saleAmount,
      totalSaleAmount,
      department,
      saleDate,
      description,
    } = req.body;

    const isValidProductID = productID && productID.length === 24;

    // مرحله 1: دریافت اطلاعات قبلی فروش
    const oldSale = await Sales.findById(_id);
    if (!oldSale)
      return res.status(404).json({ message: "❌ رکورد فروش یافت نشد." });

    const oldStockSold = oldSale.stockSold;

    // مرحله 2: دریافت اطلاعات موجودی
    const inventoryItem = await Inventory.findOne({ productId: productID });
    if (!inventoryItem)
      return res.status(404).json({ message: "❌ محصول در موجودی یافت نشد." });

    const currentStock = inventoryItem.totalCount;

    // مرحله 3: محاسبه تفاوت در مقدار توزیع
    const stockDifference = stockSold - oldStockSold;

    if (stockDifference > 0) {
      // یعنی مقدار توزیع جدید بیشتر از قبلی است
      if (currentStock < stockDifference) {
        return res.status(400).json({
          message: `❌ موجودی کافی نیست. فقط ${currentStock} عدد موجود است.`,
        });
      }
      inventoryItem.totalCount -= stockDifference;
    } else if (stockDifference < 0) {
      // یعنی مقدار توزیع کاهش یافته → باید به موجودی برگردد
      inventoryItem.totalCount += Math.abs(stockDifference);
    }

    // ذخیره‌سازی تغییرات موجودی
    await inventoryItem.save();

    // مرحله 4: آپدیت کردن رکورد فروش
    const updatedResult = await Sales.findByIdAndUpdate(
      _id,
      {
        userID,
        distributedNumber,
        category,
        productID: isValidProductID ? productID : undefined,
        stockSold,
        unit,
        saleAmount,
        totalSaleAmount,
        department,
        saleDate: saleDate ? moment(saleDate, "jYYYY/jMM/jDD").toDate() : null,
        saleDateShamsi: saleDate,

        description,
      },
      { new: true }
    );

    res.json({
      message: "✅ ویرایش با موفقیت انجام شد.",
      updatedSale: updatedResult,
      updatedInventory: {
        productId: inventoryItem.productId,
        remainingStock: inventoryItem.totalCount,
      },
    });
  } catch (error) {
    console.error("❌ خطا در updateSelectedProduct:", error);
    res.status(500).json({ message: "❌ خطا در ویرایش توزیع" });
  }
};

//////////////////////////////////////////////////////////////////////////////////
//////////////قسمت دیپارتمنت /////////////////
const getDepartments = async (req, res) => {
  try {
    const departments = await Sales.distinct("department");
    res.json(departments);
  } catch (error) {
    console.error("خطا در دریافت دپارتمان‌ها:", error);
    res.status(500).json({ message: "خطا در دریافت دپارتمان‌ها" });
  }
};
///////////////////////////////////////////////////////////////////////

// Search sales by description
const searchSales = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const sales = await Sales.find({
      description: { $regex: searchTerm, $options: "i" },
    });
    res.json(sales);
  } catch (err) {
    console.error("Error in searchSales:", err);
    res.status(500).json({ error: err.message });
  }
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// تبدیل اعداد فارسی به انگلیسی
const convertPersianToEnglishNumbers = (str) => {
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let result = str;
  persianNumbers.forEach((num, idx) => {
    result = result.replace(new RegExp(num, "g"), englishNumbers[idx]);
  });
  return result;
};

const getMonthlySalesStats = async (req, res) => {
  try {
    const { userID } = req.params;
    let selectedYear = req.query.year;

    if (!selectedYear) {
      return res.status(400).json({ error: "سال الزامی است" });
    }

    selectedYear = convertPersianToEnglishNumbers(selectedYear);

    const sales = await Sales.find({ userID });
    const monthlyCounts = new Array(12).fill(0);
    const monthlyStockSoldAmounts = new Array(12).fill(0);

    sales.forEach((sale) => {
      if (sale.saleDateShamsi) {
        let shamsiDateStr = sale.saleDateShamsi.trim();
        shamsiDateStr = convertPersianToEnglishNumbers(shamsiDateStr);

        const parts = shamsiDateStr.split("/");
        if (parts.length === 3) {
          const year = parts[0];
          const month = parseInt(parts[1], 10) - 1;

          if (year === selectedYear && month >= 0 && month < 12) {
            monthlyCounts[month] += 1;
            monthlyStockSoldAmounts[month] += sale.stockSold || 0;
          }
        }
      }
    });

    res.json({
      monthlyCounts,
      monthlyStockSoldAmounts,
    });
  } catch (err) {
    console.error("❌ خطا در دریافت فروشات ماهانه:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get monthly sales amount for a specific year (Shamsi)
///////////////////////////////////////////////////////////////////////
const convertEnglishToPersianNumbers = (str) => {
  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  let result = str;
  englishNumbers.forEach((num, idx) => {
    result = result.replace(new RegExp(num, "g"), persianNumbers[idx]);
  });
  return result;
};

const getMonthlySaleAmountCurrent = async (req, res) => {
  try {
    const { userID } = req.params;
    let { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "سال و ماه الزامی است" });
    }

    // تبدیل به دو رقمی و فارسی
    const formattedMonth = month.padStart(2, "0");
    const persianYear = convertEnglishToPersianNumbers(year);
    const persianMonth = convertEnglishToPersianNumbers(formattedMonth);
    const yearMonthPrefix = `${persianYear}/${persianMonth}`; // مثل ۱۴۰۴/۰۴

    // پیدا کردن فروشات آن ماه
    const sales = await Sales.find({
      userID,
      saleDateShamsi: { $regex: `^${yearMonthPrefix}` },
    });

    // محاسبه مجموع تعداد توزیع‌شده و مجموع مبلغ
    const totalStockSold = sales.reduce(
      (sum, sale) => sum + (sale.stockSold || 0),
      0
    );

    const totalSaleAmount = sales.reduce(
      (sum, sale) => sum + (sale.totalSaleAmount || 0),
      0
    );

    res.status(200).json({
      totalStockSold, // تعداد اجناس توزیع‌شده در آن ماه
      totalSaleAmount, // مجموع مبلغ فروش
    });
  } catch (error) {
    console.error("❌ خطا در دریافت فروش ماه جاری:", error);
    res.status(500).json({ message: "خطا در دریافت اطلاعات فروش ماه جاری" });
  }
};

module.exports = {
  addSales,
  getSalesData,
  getTotalSalesAmount,
  deleteSaleById,
  updateSelectedProduct,
  searchSales,
  getDepartments,
  getMonthlySaleAmountCurrent,
  getMonthlySalesStats,
};

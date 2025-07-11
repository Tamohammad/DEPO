import React, { useState, useEffect, useContext } from "react";
import DateRangeModal from "../components/DateRangePicker";
import axios from "axios";
import AuthContext from "../AuthContext";
import moment from "jalali-moment";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Calendar } from "react-modern-calendar-datepicker";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import QuickTimeReport from "../components/QuickTimeReport";

const Reports = () => {
  const [reportType, setReportType] = useState("daily");
  const [reportData, setReportData] = useState([]);
  const [totalSummary, setTotalSummary] = useState({
    totalPurchases: 0,
    totalSales: 0,
    totalItems: 0,
    purchaseRecords: 0, // تعداد رکوردهای خرید
    saleRecords: 0, // تعداد رکوردهای توزیع
    inventoryRecords: 0, // تعداد رکوردهای موجودی
  });
  const [allItems, setAllItems] = useState([]);
  //  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [dateRange, setDateRange] = useState({
  //   startDate: null,
  //   endDate: null,
  //   gregorianStartDate: "",
  //   gregorianEndDate: ""
  // });

  const [detailsType, setDetailsType] = useState("");
  const [detailedItems, setDetailedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterUnit, setFilterUnit] = useState("");

  const categories = [...new Set(allItems.map((item) => item.category))];
  const units = [...new Set(allItems.map((item) => item.unit))];

  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // نمایش جدول جزئیات
  const [showInventoryDetails, setShowInventoryDetails] = useState(false);
  const [showPurchaseDetails, setShowPurchaseDetails] = useState(false);

  const authContext = useContext(AuthContext);
  const [purchaseDetails, setPurchaseDetails] = useState([]);

  //
  const [activeView, setActiveView] = useState("general"); // 'general', 'purchase', 'sale', 'inventory'
  const [detailedData, setDetailedData] = useState([]);

  // const [allItems, setAllItems] = useState([]);

  // تابع جدید برای پردازش داده‌ها و حذف موارد تکراری
  const processInventoryData = (products = [], sales = [], purchases = []) => {
    const itemsMap = new Map();

    // 1. موجودی فعلی از collection: product
    products.forEach((item) => {
      const key = item.name || item.description;
      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          name: key,
          unit: item.unit || "",
          category: item.category || "",
          count: item.count || 0,
          StockSold: 0,
          quantityPurchased: 0,
        });
      } else {
        const existing = itemsMap.get(key);
        existing.count += item.count || 0;
      }
    });

    // 2. مقدار توزیع‌شده از collection: sale
    sales.forEach((item) => {
      const key = item.productID?.name || item.description;
      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          name: key,
          unit: item.unit || "",
          category: item.category || "",
          count: 0,
          StockSold: item.stockSold || 0,
          quantityPurchased: 0,
        });
      } else {
        const existing = itemsMap.get(key);
        existing.StockSold += item.stockSold || 0;
      }
    });

    // 3. مقدار خرید از collection: purchase
    purchases.forEach((item) => {
      const key = item.productID || item.description;
      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          name: key,
          unit: item.unit || "",
          category: item.category || "",
          count: 0,
          StockSold: 0,
          quantityPurchased: item.quantityPurchased || 0,
        });
      } else {
        const existing = itemsMap.get(key);
        existing.quantityPurchased += item.quantityPurchased || 0;
      }
    });

    return Array.from(itemsMap.values());
  };

  // اصلاح تابع fetchAllItems
  const fetchAllItems = async () => {
    try {
      const [productsRes, salesRes, purchasesRes] = await Promise.all([
        axios.get(
          "http://localhost:4000/api/product/get/" + authContext.user._id
        ),
        axios.get(
          "http://localhost:4000/api/sales/get/" + authContext.user._id
        ),
        axios.get(
          "http://localhost:4000/api/purchase/get/" + authContext.user._id
        ),
      ]);

      const products = productsRes.data || [];
      const sales = salesRes.data || [];
      const purchases = purchasesRes.data || [];

      const processedData = processInventoryData(products, sales, purchases);
      setAllItems(processedData);
      setTotalSummary((prev) => ({
        ...prev,
        allItemsRecords: processedData.length,
      }));
    } catch (error) {
      console.error("❌ خطا در دریافت اطلاعات از کلکشن‌ها:", error);
      setAllItems([]);
    }
  };

  ////////////////////////////// تنظیم بخش فلتر گزارش بر اساس روزانه ماهانه .....

  function getItemDate(item, detailsType) {
    if (detailsType === "purchase") {
      return item.purchaseDate;
    } else if (detailsType === "sale") {
      return item.saleDate || item.date;
    } else if (detailsType === "inventory") {
      return item.addedDate || item.date; // مثلا اگر داری
    } else {
      return item.date;
    }
  }

  ///////

  function parseDate(dateStr) {
    if (!dateStr) return null;
    // اگر تاریخ شمسی است و در قالب "jYYYY/jMM/jDD"
    if (dateStr.includes("/")) {
      return moment.from(dateStr, "fa", "jYYYY/jMM/jDD").toDate();
    }
    // تاریخ میلادی یا ISO
    return new Date(dateStr);
  }

  function filterDataByDateRange(data, startDate, endDate, detailsType) {
    if (!startDate || !endDate) return data;

    const start = new Date(startDate);
    const end = new Date(endDate);

    return data.filter((item) => {
      const rawDate = getItemDate(item, detailsType);
      const itemDate = parseDate(rawDate);

      if (!itemDate) return false; // اگر تاریخ نامعتبر است، رد شود

      return itemDate >= start && itemDate <= end;
    });
  }

  //////////////////////////////////////////////////////////////

  // دریافت همه اجناس (موجودی کلی)
  // const fetchAllItems = async () => {
  //   try {
  //     const response = await axios.get("http://localhost:4000/api/inventory/all");
  //     setAllItems(response.data || []);
  //   } catch (error) {
  //     console.error("خطا در دریافت تمام اجناس:", error);
  //     setAllItems([]);
  //   }
  // };

  // دریافت داده گزارش بر اساس نوع و بازه زمانی
  const fetchReportData = async (type, startDate, endDate) => {
    try {
      let gregorianStartDate = "";
      let gregorianEndDate = "";

      // اگر بازه‌ای انتخاب نشده، مقدار پیش‌فرض را براساس نوع گزارش تعیین کن
      if (!startDate || !endDate) {
        const today = moment().locale("fa");
        if (type === "daily") {
          gregorianStartDate = gregorianEndDate = today.format("YYYY-MM-DD");
        } else if (type === "monthly") {
          gregorianStartDate = today.startOf("jMonth").format("YYYY-MM-DD");
          gregorianEndDate = today.endOf("jMonth").format("YYYY-MM-DD");
        } else if (type === "quarterly") {
          const startOfQuarter = today
            .clone()
            .subtract(2, "jMonth")
            .startOf("jMonth");
          gregorianStartDate = startOfQuarter.format("YYYY-MM-DD");
          gregorianEndDate = today.endOf("jMonth").format("YYYY-MM-DD");
        } else if (type === "yearly") {
          gregorianStartDate = today.startOf("jYear").format("YYYY-MM-DD");
          gregorianEndDate = today.endOf("jYear").format("YYYY-MM-DD");
        }
      } else {
        gregorianStartDate = moment
          .from(startDate, "fa", "jYYYY/jMM/jDD")
          .format("YYYY-MM-DD");
        gregorianEndDate = moment
          .from(endDate, "fa", "jYYYY/jMM/jDD")
          .format("YYYY-MM-DD");
      }

      const response = await axios.post("http://localhost:4000/api/report", {
        type,
        startDate: gregorianStartDate,
        endDate: gregorianEndDate,
      });

      const data = response.data.data || [];

      // محاسبه تعداد رکوردهای غیرصفر
      const purchaseCount = data.filter((item) => item.purchases > 0).length;
      const saleCount = data.filter((item) => item.sales > 0).length;
      const inventoryCount = data.filter((item) => item.remaining > 0).length;

      setTotalSummary({
        totalPurchases: data.reduce(
          (sum, item) => sum + (item.purchases || 0),
          0
        ),
        totalSales: data.reduce((sum, item) => sum + (item.sales || 0), 0),
        totalItems: data.reduce((sum, item) => sum + (item.remaining || 0), 0),
        purchaseRecords: purchaseCount,
        saleRecords: saleCount,
        inventoryRecords: inventoryCount,
        allItemsRecords: data.length,
      });

      setReportData(data);
    } catch (err) {
      console.error("خطا در دریافت داده‌های گزارش:", err);
      setReportData([]);
      setTotalSummary((prev) => ({ ...prev, allItemsRecords: 0 }));
    }
  };
  /////////////////////////////////

  // دریافت جزئیات موجودی
  const fetchPurchaseDetails = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/purchase/get/${authContext.user._id}`
      );
      setPurchaseDetails(res.data || []);
      setTotalSummary((prev) => ({
        ...prev,
        purchaseRecords: res.data?.length || 0,
        totalPurchases:
          res.data?.reduce(
            (sum, item) => sum + (item.quantityPurchased || 0),
            0
          ) || 0,
      }));
    } catch (err) {
      console.error("خطا در دریافت خریدها:", err);
    }
  };

  const fetchSaleDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/sale/get/${authContext.user._id}`
      );
      const formattedData = response.data.map((item) => ({
        name: item.productID?.name || item.description,
        stockSold: item.stockSold,
        unit: item.unit,
        saleDate: item.saleDate,
        saleAmount: item.saleAmount,
        totalSaleAmount: item.totalSaleAmount,
        department: item.department,
        // اضافه کردن فیلدهای دیگر در صورت نیاز
      }));
      setDetailedItems(formattedData);
    } catch (error) {
      console.error("خطا در دریافت داده‌های فروش:", error);
    }
  };

  const fetchInventoryDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/product/get/${authContext.user._id}`
      );
      setDetailedData(response.data || []);
    } catch (error) {
      console.error("خطا در دریافت داده‌های موجودی:", error);
    }
  };

  ///////////////////////////////////////////

  // const filteredItems = filterDataByDateRange(allItems, dateRange.gregorianStartDate, dateRange.gregorianEndDate);

  // data: آرایه داده‌ها، startDate و endDate رشته ISO تاریخ (مثلاً '2025-06-01')
  // function filterDataByDateRange(data, startDate, endDate) {
  //   if (!startDate || !endDate) {
  //     // اگر تاریخ داده نشده بود، همه داده‌ها را بازگردان
  //     return data;
  //   }

  //   const start = new Date(startDate);
  //   const end = new Date(endDate);

  //   return data.filter(item => {
  //     // فرض می‌کنیم item تاریخش به صورت ISO string در فیلدی مثل item.date ذخیره است
  //     // اگر ساختار تاریخت فرق می‌کند، نام فیلد را اصلاح کن
  //     const itemDate = new Date(item.date);

  //     return itemDate >= start && itemDate <= end;
  //   });
  // }

  ////////////////////////////////////////////////
  const fetchDetailedItems = async (type) => {
    try {
      if (type === "inventory") {
        const response = await axios.get(
          `http://localhost:4000/api/product/get/${authContext.user._id}`
        );
        setDetailedItems(response.data || []);
        setTotalSummary((prev) => ({
          ...prev,
          inventoryRecords: response.data?.length || 0,
          totalItems:
            response.data?.reduce((sum, item) => sum + (item.count || 0), 0) ||
            0,
        }));
      } else if (type === "sale") {
        const response = await axios.get(
          `http://localhost:4000/api/sales/get/${authContext.user._id}`
        );
        const formattedData = response.data.map((item) => ({
          distributedNumber: item.distributedNumber,
          category: item.category,
          name: item.productID?.name || item.description || "نامعلوم",
          stockSold: item.stockSold,
          unit: item.unit,
          saleDate: item.saleDate,
          saleAmount: item.saleAmount,
          totalSaleAmount: item.totalSaleAmount,
          department: item.department,
          description: item.description,
        }));
        setDetailedItems(formattedData);
        setTotalSummary((prev) => ({
          ...prev,
          saleRecords: formattedData.length,
          totalSales:
            formattedData.reduce(
              (sum, item) => sum + (item.stockSold || 0),
              0
            ) || 0,
        }));
      } else if (type === "purchase") {
        const response = await axios.get(
          `http://localhost:4000/api/purchase/get/${authContext.user._id}`
        );
        setDetailedItems(response.data || []);
        setTotalSummary((prev) => ({
          ...prev,
          purchaseRecords: response.data?.length || 0,
          totalPurchases:
            response.data?.reduce(
              (sum, item) => sum + (item.quantityPurchased || 0),
              0
            ) || 0,
        }));
      }
    } catch (error) {
      console.error(`خطا در دریافت ${type} داده‌ها:`, error);
    }
  };

  // فیلتر کردن آیتم‌های جزئیات
  const filteredDetailedItems = detailedItems.filter((item) => {
    const nameMatch =
      item.productID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchTerm === "";

    const categoryMatch = filterCategory
      ? item.category === filterCategory
      : true;
    const unitMatch = filterUnit ? item.unit === filterUnit : true;

    return nameMatch && categoryMatch && unitMatch;
  });

  // هندلرهای دکمه‌ها
  const handleShowPurchaseClick = () => {
    setDetailsType("purchase");
    setShowPurchaseDetails(true);
    setShowInventoryDetails(false);
    fetchDetailedItems("purchase");
    fetchPurchaseDetails();
  };

  const handleShowSaleClick = () => {
    setDetailsType("sale");
    setShowInventoryDetails(false);
    setShowPurchaseDetails(false);
    fetchDetailedItems("sale"); // فقط همین کافیست
  };

  const handleShowInventoryClick = () => {
    setDetailsType("inventory");
    setShowInventoryDetails(true);
    setShowPurchaseDetails(false);
    fetchDetailedItems("inventory");
  };

  const handleShowGeneralReport = () => {
    setDetailsType("");
    setShowInventoryDetails(false);
    setShowPurchaseDetails(false);
    setDetailedItems([]);
  };
  //////////////////////////////////////////////////////////
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dateRange, setDateRange] = useState({
    gregorianStartDate: "",
    gregorianEndDate: "",
  });

  const handleDateRangeSelect = ({ gregorianStartDate, gregorianEndDate }) => {
    setDateRange({
      gregorianStartDate,
      gregorianEndDate,
    });
    setIsModalOpen(false);
  };

  ////////////////////////////////////

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title =
      detailsType === "purchase"
        ? "گزارش خرید"
        : detailsType === "sale"
        ? "گزارش توزیع"
        : detailsType === "inventory"
        ? "گزارش موجودی"
        : "گزارش کلی";

    const headers =
      detailsType === "purchase"
        ? ["کتگوری", "نام جنس", "تعداد", "واحد", "تاریخ", "قیمت فی", "مبلغ"]
        : detailsType === "sale"
        ? [
            "نام محصول",
            "مقدار",
            "واحد",
            "تاریخ",
            "قیمت فی",
            "قیمت مجموع",
            "دیپارتمنت",
          ]
        : detailsType === "inventory"
        ? ["نام جنس", "تعداد", "واحد", "قیمت فی", "قیمت مجموعی", "کتگوری"]
        : ["نام جنس", "مجموع خرید", "مجموع توزیع", "موجودی فعلی"];

    const data = (detailsType ? filteredDetailedItems : allItems).map(
      (item) => {
        if (detailsType === "purchase") {
          return [
            item.category,
            item.productID,
            item.quantityPurchased,
            item.unit,
            moment(item.purchaseDate).locale("fa").format("jYYYY/jMM/jDD"),
            item.pricePerUnit,
            item.totalPurchaseAmount,
          ];
        } else if (detailsType === "sale") {
          return [
            item.distributedNumber,
            item.category,
            item.itemName,
            item.quantity,
            item.unit,
            moment(item.date).locale("fa").format("jYYYY/jMM/jDD"),
            item.saleAmount,
            item.totalSaleAmount,
            item.department,
            item.description,
          ];
        } else if (detailsType === "inventory") {
          return [
            item.itemName || item.description,
            item.count,
            item.unit,
            item.priceperunit,
            item.count * item.priceperunit,
            item.category,
          ];
        } else {
          return [
            item.name,
            item.quantityPurchased,
            item.stockSold,
            item.count - item.stockSold,
          ];
        }
      }
    );

    doc.setFont("Vazir");
    doc.setFontSize(14);
    doc.text(title, 15, 15);

    // استفاده از autoTable به صورت تابع جداگانه
    autoTable(doc, {
      startY: 20,
      head: [headers],
      body: data,
      styles: { font: "normal", fontSize: 10 },
    });

    doc.save(`${title}.pdf`);
  };

  ////////////////////////////

  const handleExportExcel = () => {
    const title =
      detailsType === "purchase"
        ? "گزارش_اعاده شده"
        : detailsType === "sale"
        ? "گزارش_توزیع"
        : detailsType === "inventory"
        ? "گزارش_موجودی"
        : "گزارش_کلی";

    const data = (detailsType ? filteredDetailedItems : allItems).map(
      (item) => {
        if (detailsType === "purchase") {
          return {
            کتگوری: item.category,
            نام_جنس: item.productID,
            تعداد: item.quantityPurchased,
            واحد: item.unit,
            تاریخ: moment(item.purchaseDate)
              .locale("fa")
              .format("jYYYY/jMM/jDD"),
            قیمت_فی: item.pricePerUnit,
            مبلغ: item.totalPurchaseAmount,
          };
        } else if (detailsType === "sale") {
          return {
            نمبر: item.distributedNumber,
            کتگوری: item.category,
            نام_محصول: item.name,
            مقدار: item.stockSold,
            واحد: item.unit,
            تاریخ: moment(item.date).locale("fa").format("jYYYY/jMM/jDD"),
            قیمت_فی_واحد: item.saleAmount,
            قیمت_مجموع: item.totalSaleAmount,
            دیپارتمنت: item.department,
            توضیحات: item.description,
          };
        } else if (detailsType === "inventory") {
          return {
            نمبر: item.ticketserialnumber,
            تاریخ: moment(item.date).locale("fa").format("jYYYY/jMM/jDD"),
            نام_جنس: item.name,
            توضیحات: item.description,
            تعداد: item.count,
            واحد: item.unit,
            قیمت_فیات: item.priceperunit,
            قیمت_مجموعی: item.count * item.priceperunit,
            کتگوری: item.category,
          };
        } else {
          return {
            نام_جنس: item.name,
            مجموع_اعاده: item.quantityPurchased,
            مجموع_توزیع: item.stockSold,
            موجودی_فعلی: item.count - item.stockSold,
          };
        }
      }
    );

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  //
  // const [showCalendar, setShowCalendar] = useState(false);
  const [showQuickReport, setShowQuickReport] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchAllItems();
      await fetchReportData(reportType, "", "");
      await fetchPurchaseDetails("purchase"); // دریافت داده‌های خرید
      await fetchDetailedItems("inventory"); // دریافت داده‌های موجودی
      await fetchDetailedItems("sale"); // دریافت داده‌های فروش
    };

    fetchInitialData();
  }, []);

  // در useEffect مربوطه
  useEffect(() => {
    if (dateRange.gregorianStartDate && dateRange.gregorianEndDate) {
      fetchReportData(
        reportType,
        dateRange.gregorianStartDate,
        dateRange.gregorianEndDate
      );
    } else {
      fetchReportData(reportType, "", "");
    }
  }, [reportType, dateRange.gregorianStartDate, dateRange.gregorianEndDate]);

  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // useEffect(() => {
  //   fetchAllItems();
  //   fetchReportData(reportType, "", "");
  // }, []);

  // useEffect(() => {
  //   fetchReportData(reportType, dateRange.startDate, dateRange.endDate);
  // }, [reportType, dateRange]);

  return (
    <div
      dir="rtl"
      className="lg:col-span-10 col-span-12 p-10 bg-gray-100 min-h-screen w-full max-w-screen-xl mx-auto "
    >
      <h2 className="text-xl font-bold mb-4">گزارشات اجناس</h2>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* <select
  value={reportType}
  onChange={(e) => {
    setReportType(e.target.value);
    setDateRange({ gregorianStartDate: "", gregorianEndDate: "" });
  }}
  className="py-2 rounded bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <option value="all">کلی</option>
  <option value="daily">روزانه</option>
  <option value="monthly">ماهیانه</option>
  {/* <option value="quarterly">سه‌ماهه</option> 
  <option value="yearly">سالانه</option>
</select> 
*/}

          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              بخش فلتر گزارشات
            </button>

            {/* دیالوگ باکس برای فیلتر تاریخ */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6">
                  {/* دکمه بستن */}
                  <button
                    onClick={() => window.location.reload()}
                    className="absolute top-2 left-3 text-gray-600 text-2xl hover:text-red-500"
                  >
                    ×
                  </button>

                  <h3 className="text-xl font-semibold mb-4">
                    فیلتر گزارشات بر اساس تاریخ و دوره زمانی
                  </h3>

                  {/* دکمه برای نمایش تقویم */}
                  <div className="mb-4">
                    <button
                      onClick={() => setShowCalendar((prev) => !prev)}
                      onClose={() => setShowCalendar(false)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      انتخاب تاریخ
                    </button>

                    <button
                      onClick={() => setShowQuickReport((prev) => !prev)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                    >
                      گزارش سریع زمانی
                    </button>

                    {showQuickReport && <QuickTimeReport />}

                    {/* نمایش کلندر */}
                    {showCalendar && (
                      <div className="mt-4 border rounded p-4 shadow">
                        <DateRangeModal
                          isOpen={true}
                          onClose={() => setShowCalendar(false)}
                          onSelect={(range) => {
                            handleDateRangeSelect(range);
                            setShowCalendar(false);
                            setIsModalOpen(false); // بستن دیالوگ بعد از انتخاب تاریخ (اختیاری)
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="relative inline-block text-left">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              دانلود گزارش
            </button>

            {exportMenuOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white border rounded shadow z-10">
                <button
                  onClick={() => {
                    handleExportPDF();
                    setExportMenuOpen(false);
                  }}
                  className="block w-full text-right px-4 py-2 hover:bg-gray-100"
                >
                  فایل PDF
                </button>
                <button
                  onClick={() => {
                    handleExportExcel();
                    setExportMenuOpen(false);
                  }}
                  className="block w-full text-right px-4 py-2 hover:bg-gray-100"
                >
                  فایل Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* بخش خلاصه گزارش */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={handleShowPurchaseClick}
          className="bg-blue-50 p-4 rounded text-right hover:bg-blue-100"
        >
          <p className="text-gray-500">اجناس اعاده شده</p>
          <p className="text-2xl font-bold">
            {totalSummary.purchaseRecords}
            <span className="text-sm">رکورد</span>
          </p>
        </button>

        <button
          onClick={handleShowSaleClick}
          className="bg-green-50 p-4 rounded text-right hover:bg-green-100"
        >
          <p className="text-gray-500">اجناس توزیع شده</p>
          <p className="text-2xl font-bold">
            {totalSummary.saleRecords} <span className="text-sm">رکورد</span>
          </p>
        </button>

        <button
          onClick={handleShowInventoryClick}
          className="bg-yellow-50 p-4 rounded text-right hover:bg-yellow-100"
        >
          <p className="text-gray-500">اجناس موجودی</p>
          <p className="text-2xl font-bold">
            {totalSummary.inventoryRecords}{" "}
            <span className="text-sm">رکورد</span>
          </p>
        </button>

        <button
          onClick={handleShowGeneralReport}
          className="bg-purple-50 p-4 rounded text-right hover:bg-purple-200"
        >
          <p className="text-gray-600">گزارش عمومی</p>

          <p className="text-sm text-gray-500">
            {allItems.length} <span className="text-sm">رکورد</span>
          </p>
        </button>
      </div>

      {/* فیلترهای جستجو */}
      {(showInventoryDetails ||
        showPurchaseDetails ||
        detailsType === "sale") && (
        <div className="mb-4 flex gap-4 items-center">
          <input
            type="text"
            placeholder="جستجو بر اساس نام جنس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded flex-grow"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border rounded"
          >
            <option value="">کتگوری‌ها</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
            className="border rounded"
          >
            <option value="">همه واحدها</option>
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* جدول جزئیات */}
      {(showInventoryDetails ||
        showPurchaseDetails ||
        detailsType === "sale") && (
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-2">
            اجناس{" "}
            {detailsType === "purchase"
              ? "اعاده شده"
              : detailsType === "sale"
              ? "توزیع شده"
              : "موجودی"}
          </h3>

          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200 text-right">
              <thead className="bg-gray-50 text-sm font-semibold">
                <tr>
                  {detailsType === "purchase" && (
                    <>
                      <th className="px-4 py-2">کتگوری</th>
                      <th className="px-4 py-2">نام جنس</th>
                      <th className="px-4 py-2">تعداد خرید</th>
                      <th className="px-4 py-2">واحد</th>
                      <th className="px-4 py-2">تاریخ خرید</th>
                      <th className="px-4 py-2">قیمت فی</th>
                      <th className="px-4 py-2">مجموع مبلغ</th>
                    </>
                  )}

                  {detailsType === "sale" && (
                    <>
                      <th className="px-4 py-2">نمبر توزیع</th>
                      <th className="px-4 py-2">کتگوری</th>
                      <th className="px-4 py-2">نام جنس</th>
                      <th className="px-4 py-2">مقدار</th>
                      <th className="px-4 py-2">واحد</th>
                      <th className="px-4 py-2">تاریخ</th>
                      <th className="px-4 py-2">قیمت فی واحد</th>
                      <th className="px-4 py-2">قیمت مجموع</th>
                      <th className="px-4 py-2">دیپارتمنت</th>
                      <th className="px-4 py-2">توضیحات</th>
                    </>
                  )}

                  {detailsType === "inventory" && (
                    <>
                      <th className="px-4 py-2">نمبر تکیت</th>
                      <th className="px-4 py-2">تاریخ</th>
                      <th className="px-4 py-2">نام جنس</th>
                      <th className="px-4 py-2">مشخصات جنس</th>
                      <th className="px-4 py-2">تعداد</th>
                      <th className="px-4 py-2">واحد</th>
                      <th className="px-4 py-2">قیمت فیات</th>
                      <th className="px-4 py-2">قیمت مجموعی</th>
                      <th className="px-4 py-2">کتگوری</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {filteredDetailedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        detailsType === "purchase"
                          ? 7
                          : detailsType === "sale"
                          ? 7
                          : 6
                      }
                      className="text-center py-4 text-gray-500"
                    >
                      اطلاعاتی برای نمایش وجود ندارد.
                    </td>
                  </tr>
                ) : (
                  filteredDetailedItems.map((item, idx) => (
                    <tr key={idx}>
                      {detailsType === "purchase" && (
                        <>
                          <td className="px-4 py-2">{item.category}</td>
                          <td className="px-4 py-2">{item.productID}</td>
                          <td className="px-4 py-2">
                            {item.quantityPurchased}
                          </td>
                          <td className="px-4 py-2">{item.unit}</td>
                          <td className="px-4 py-2">
                            {moment(item.purchaseDate)
                              .locale("fa")
                              .format("jYYYY/jMM/jDD")}
                          </td>
                          <td className="px-4 py-2">{item.pricePerUnit}</td>
                          <td className="px-4 py-2">
                            {item.totalPurchaseAmount}
                          </td>
                        </>
                      )}

                      {detailsType === "sale" && (
                        <>
                          <td className="px-4 py-2">
                            {item.distributedNumber}
                          </td>
                          <td className="px-4 py-2">{item.category}</td>
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2">{item.stockSold}</td>
                          <td className="px-4 py-2">{item.unit}</td>
                          <td className="px-4 py-2">
                            {moment(item.saleDate)
                              .locale("fa")
                              .format("jYYYY/jMM/jDD")}
                          </td>
                          <td className="px-4 py-2">{item.saleAmount}</td>
                          <td className="px-4 py-2">{item.totalSaleAmount}</td>
                          <td className="px-4 py-2">{item.department}</td>
                          <td className="px-4 py-2">{item.description}</td>
                        </>
                      )}

                      {detailsType === "inventory" && (
                        <>
                          <td className="px-4 py-2">
                            {item.ticketserialnumber || "—"}
                          </td>
                          <td className="px-4 py-2">
                            {moment(item.date).format("jYYYY-jMM-jDD")}
                          </td>
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2">{item.description}</td>
                          <td className="px-4 py-2">{item.count}</td>
                          <td className="px-4 py-2">{item.unit}</td>
                          <td className="px-4 py-2">{item.priceperunit}</td>
                          <td className="px-4 py-2">
                            {Number(item.count || 0) *
                              Number(item.priceperunit || 0)}
                          </td>
                          <td className="px-4 py-2">{item.category}</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* جدول تمام اجناس موجود - وقتی جدول جزئیات بسته باشد */}
      {!showInventoryDetails &&
        !showPurchaseDetails &&
        detailsType !== "sale" && (
          <>
            <h3 className="text-lg font-semibold mb-2">
              فهرست تمام اجناس موجود
            </h3>
            <div className="overflow-x-auto bg-white rounded shadow mb-8">
              <table className="min-w-full divide-y divide-gray-200 text-right">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">نام جنس</th>
                    <th className="px-6 py-3">موجودی فعلی</th>
                    <th className="px-6 py-3">مجموع توزیع</th>
                    <th className="px-6 py-3">مجموع اجناس اعاده شده</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-4 text-gray-500"
                      >
                        هیچ جنس موجود نیست.
                      </td>
                    </tr>
                  ) : (
                    allItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-2">{item.name}</td>
                        <td className="px-6 py-2">
                          {item.count - item.StockSold}
                        </td>
                        <td className="px-6 py-2">{item.StockSold}</td>
                        <td className="px-6 py-2">{item.quantityPurchased}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
    </div>
  );
};

export default Reports;

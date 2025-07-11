import React, { useState, useContext, useEffect } from "react";
import moment from "jalali-moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AuthContext from "../AuthContext";
import axios from "axios";

const QuickTimeReport = () => {
  const { user } = useContext(AuthContext);
  const [reportType, setReportType] = useState("");
  const [timeFilterType, setTimeFilterType] = useState("");
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // تابع کمکی برای تبدیل تاریخ‌ها
  const parseDate = (rawDate) => {
    if (!rawDate) return null;

    let m = moment(rawDate);
    if (m.isValid()) return m;

    m = moment.from(rawDate, "fa", "jYYYY/jMM/jDD");
    if (m.isValid()) return m;

    return null;
  };

  useEffect(() => {
    if (user && reportType) {
      fetchData();
      setTimeFilterType("");
      setSearchTerm("");
    }
  }, [reportType]);

  const fetchData = async () => {
    try {
      setError("");
      let res;
      if (reportType === "purchase") {
        res = await axios.get(
          `http://localhost:4000/api/purchase/get/${user._id}`
        );
      } else if (reportType === "sale") {
        res = await axios.get(
          `http://localhost:4000/api/sales/get/${user._id}`
        );
      } else if (reportType === "inventory") {
        res = await axios.get(
          `http://localhost:4000/api/product/get/${user._id}`
        );
      } else {
        setAllItems([]);
        setFilteredItems([]);
        return;
      }

      console.log("داده‌های دریافت شده:", res.data);
      setAllItems(res.data);
      setFilteredItems(res.data);
    } catch (err) {
      setError("خطا در دریافت اطلاعات");
      setAllItems([]);
      setFilteredItems([]);
    }
  };

  const filterByTime = (type) => {
    if (allItems.length === 0) {
      setError("لطفاً ابتدا نوع گزارش را انتخاب کنید");
      return;
    }
    setError("");
    setTimeFilterType(type);

    const now = moment();

    console.log("نوع فیلتر:", type);
    console.log("تاریخ امروز:", now.format());
    const filtered = allItems.filter((item) => {
      let rawDate;

      if (reportType === "purchase") {
        rawDate = item.purchaseDate;
      } else if (reportType === "sale") {
        rawDate = item.saleDate;
      } else if (reportType === "inventory") {
        rawDate = item.date;
      } else {
        return false;
      }

      console.log("تاریخ خام آیتم:", rawDate);

      const itemDate = parseDate(rawDate);
      if (!itemDate) return false;

      console.log("تاریخ تبدیل شده:", itemDate.format());

      switch (type) {
        case "daily":
          return itemDate.isSame(now, "day");
        case "monthly":
          return itemDate.isSame(now, "month");
        case "quarterly":
          const nowQuarter = Math.floor(now.month() / 3);
          const itemQuarter = Math.floor(itemDate.month() / 3);
          return itemDate.year() === now.year() && nowQuarter === itemQuarter;
        case "yearly":
          return itemDate.isSame(now, "year");
        default:
          return true;
      }
    });

    setFilteredItems(filtered);
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    const search = text.toLowerCase();
    const filtered = allItems.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(search)
    );
    setFilteredItems(filtered);
  };

  const handleDownloadExcel = () => {
    if (filteredItems.length === 0) return;

    const title =
      reportType === "purchase"
        ? "گزارش_خرید"
        : reportType === "sale"
        ? "گزارش_توزیع"
        : "گزارش_موجودی";

    const data = filteredItems.map((item) => {
      if (reportType === "purchase") {
        return {
          کتگوری: item.category,
          نام_جنس: item.productID,
          تعداد: item.quantityPurchased,
          واحد: item.unit,
          تاریخ: moment(item.purchaseDate).locale("fa").format("jYYYY/jMM/jDD"),
          قیمت_فی: item.pricePerUnit,
          مبلغ: item.totalPurchaseAmount,
        };
      } else if (reportType === "sale") {
        return {
          نمبر: item.distributedNumber,
          کتگوری: item.category,
          نام_محصول: item.productID?.name,
          مقدار: item.stockSold,
          واحد: item.unit,
          تاریخ: moment(item.saleDate).locale("fa").format("jYYYY/jMM/jDD"),
          قیمت_فی_واحد: item.saleAmount,
          قیمت_مجموع: item.totalSaleAmount,
          دیپارتمنت: item.department,
          توضیحات: item.description,
        };
      } else if (reportType === "inventory") {
        return {
          نمبر: item.ticketserialnumber || "—",
          تاریخ: moment(item.date).locale("fa").format("jYYYY/jMM/jDD"),
          نام_جنس: item.name,
          مشخصات: item.description,
          تعداد: item.count,
          واحد: item.unit,
          قیمت_فیات: item.priceperunit,
          قیمت_مجموعی: item.count * item.priceperunit,
          کتگوری: item.category,
        };
      } else {
        return {};
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  const handleDownloadPDF = () => {
    if (filteredItems.length === 0) return;

    const doc = new jsPDF();
    const title =
      reportType === "purchase"
        ? "گزارش خرید"
        : reportType === "sale"
        ? "گزارش توزیع"
        : "گزارش موجودی";

    const headers =
      reportType === "purchase"
        ? ["کتگوری", "نام جنس", "تعداد", "واحد", "تاریخ", "قیمت فی", "مبلغ"]
        : reportType === "sale"
        ? [
            "نمبر",
            "کتگوری",
            "نام محصول",
            "مقدار",
            "واحد",
            "تاریخ",
            "قیمت فی واحد",
            "قیمت مجموع",
            "دیپارتمنت",
            "توضیحات",
          ]
        : [
            "نمبر",
            "تاریخ",
            "نام جنس",
            "مشخصات",
            "تعداد",
            "واحد",
            "قیمت فیات",
            "قیمت مجموعی",
            "کتگوری",
          ];

    const data = filteredItems.map((item) => {
      if (reportType === "purchase") {
        return [
          item.category,
          item.productID,
          item.quantityPurchased,
          item.unit,
          moment(item.purchaseDate).locale("fa").format("jYYYY/jMM/jDD"),
          item.pricePerUnit,
          item.totalPurchaseAmount,
        ];
      } else if (reportType === "sale") {
        return [
          item.distributedNumber,
          item.category,
          item.productID?.name,
          item.stockSold,
          item.unit,
          moment(item.saleDate).locale("fa").format("jYYYY/jMM/jDD"),
          item.saleAmount,
          item.totalSaleAmount,
          item.department,
          item.description,
        ];
      } else {
        return [
          item.ticketserialnumber || "—",
          moment(item.date).locale("fa").format("jYYYY/jMM/jDD"),
          item.name,
          item.description,
          item.count,
          item.unit,
          item.priceperunit,
          item.count * item.priceperunit,
          item.category,
        ];
      }
    });

    doc.setFontSize(14);
    doc.text(title, 15, 15);
    autoTable(doc, {
      startY: 20,
      head: [headers],
      body: data,
      styles: { fontSize: 10, font: "normal" },
    });
    doc.save(`${title}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow text-right">
      <h2 className="text-xl font-bold mb-4">گزارش زمانی سریع</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block mb-1 font-medium">نوع گزارش:</label>
        <select
          className="border rounded w-full py-2"
          value={reportType}
          onChange={(e) => {
            setReportType(e.target.value);
            setTimeFilterType("");
            setSearchTerm("");
          }}
        >
          <option value="">-- انتخاب کنید --</option>
          <option value="purchase">اعاده شده</option>
          <option value="sale">توزیع</option>
          <option value="inventory">موجودی</option>
        </select>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => filterByTime("daily")}
          className={`px-4 py-2 rounded text-white ${
            timeFilterType === "daily" ? "bg-blue-700" : "bg-blue-500"
          }`}
        >
          روزانه
        </button>
        <button
          onClick={() => filterByTime("monthly")}
          className={`px-4 py-2 rounded text-white ${
            timeFilterType === "monthly" ? "bg-blue-700" : "bg-blue-500"
          }`}
        >
          ماهانه
        </button>
        <button
          onClick={() => filterByTime("quarterly")}
          className={`px-4 py-2 rounded text-white ${
            timeFilterType === "quarterly" ? "bg-blue-700" : "bg-blue-500"
          }`}
        >
          سه‌ماهه
        </button>
        <button
          onClick={() => filterByTime("yearly")}
          className={`px-4 py-2 rounded text-white ${
            timeFilterType === "yearly" ? "bg-blue-700" : "bg-blue-500"
          }`}
        >
          سالانه
        </button>
      </div>

      <div className="flex justify-between items-center my-4">
        <input
          type="text"
          placeholder="جستجو..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="border p-2 rounded w-1/2"
        />

        <div className="flex gap-2">
          <button
            onClick={handleDownloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            📊 Excel
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            📄 PDF
          </button>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200 text-sm text-right">
          <thead className="bg-gray-100">
            <tr>
              {reportType === "purchase" && (
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
              {reportType === "sale" && (
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
              {reportType === "inventory" && (
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
          <tbody>
            {filteredItems.map((item, idx) => (
              <tr key={idx}>
                {reportType === "purchase" && (
                  <>
                    <td className="px-4 py-2">{item.category}</td>
                    <td className="px-4 py-2">{item.productID}</td>
                    <td className="px-4 py-2">{item.quantityPurchased}</td>
                    <td className="px-4 py-2">{item.unit}</td>
                    <td className="px-4 py-2">
                      {moment(item.purchaseDate)
                        .locale("fa")
                        .format("jYYYY/jMM/jDD")}
                    </td>
                    <td className="px-4 py-2">{item.pricePerUnit}</td>
                    <td className="px-4 py-2">{item.totalPurchaseAmount}</td>
                  </>
                )}
                {reportType === "sale" && (
                  <>
                    <td className="px-4 py-2">{item.distributedNumber}</td>
                    <td className="px-4 py-2">{item.category}</td>
                    <td className="px-4 py-2">{item.productID?.name}</td>
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
                {reportType === "inventory" && (
                  <>
                    <td className="px-4 py-2">
                      {item.ticketserialnumber || "—"}
                    </td>
                    <td className="px-4 py-2">
                      {moment(item.date).locale("fa").format("jYYYY/jMM/jDD")}
                    </td>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-4 py-2">{item.count}</td>
                    <td className="px-4 py-2">{item.unit}</td>
                    <td className="px-4 py-2">{item.priceperunit}</td>
                    <td className="px-4 py-2">
                      {Number(item.count || 0) * Number(item.priceperunit || 0)}
                    </td>

                    <td className="px-4 py-2">{item.category}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-center mt-4">هیچ داده‌ای موجود نیست</p>
      )}
    </div>
  );
};

export default QuickTimeReport;

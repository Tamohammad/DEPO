import React, { useState, useContext } from "react";
import { Calendar } from "react-modern-calendar-datepicker";
import moment from "jalali-moment";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import axios from "axios";
import AuthContext from "../AuthContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReportFilter = () => {
  const { user } = useContext(AuthContext);

  const [selectedRange, setSelectedRange] = useState({ from: null, to: null });
  const [reportType, setReportType] = useState("");
  const [allItems, setAllItems] = useState([]); // داده اصلی نگه داشته شود
  const [filteredDetailedItems, setFilteredDetailedItems] = useState([]);
  const [detailsType, setDetailsType] = useState("");
  const [error, setError] = useState("");
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const formatDate = (date) =>
    `${date.year}/${String(date.month).padStart(2, "0")}/${String(date.day).padStart(2, "0")}`;

  const handleSubmit = async () => {
    setError("");
    if (!user) {
      setError("کاربر احراز هویت نشده است");
      return;
    }
    if (!selectedRange.from || !selectedRange.to) {
      setError("لطفاً دوره زمانی را انتخاب کنید");
      return;
    }
    if (!reportType) {
      setError("لطفاً نوع گزارش را انتخاب کنید");
      return;
    }

    const start = moment
      .from(
        `${selectedRange.from.year}/${selectedRange.from.month}/${selectedRange.from.day}`,
        "fa",
        "jYYYY/jMM/jDD"
      )
      .format("YYYY-MM-DD");

    const end = moment
      .from(
        `${selectedRange.to.year}/${selectedRange.to.month}/${selectedRange.to.day}`,
        "fa",
        "jYYYY/jMM/jDD"
      )
      .format("YYYY-MM-DD");

    try {
      const [productsRes, salesRes, purchasesRes] = await Promise.all([
        axios.get(`http://localhost:4000/api/product/get/${user}`),
        axios.get(`http://localhost:4000/api/sales/get/${user}`),
        axios.get(`http://localhost:4000/api/purchase/get/${user}`),
      ]);

      let rawData = [];
      if (reportType === "purchase") {
        rawData = purchasesRes.data;
      } else if (reportType === "sale") {
        rawData = salesRes.data;
      } else if (reportType === "inventory") {
        rawData = productsRes.data;
      }

      const filtered = rawData.filter((item) => {
        const itemDate = moment(item.date || item.purchaseDate || item.saleDate);
        return itemDate.isBetween(start, end, null, "[]");
      });

      setAllItems(filtered); // داده اصلی را ذخیره کن
      setFilteredDetailedItems(filtered);
      setDetailsType(reportType);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError("خطا در دریافت اطلاعات");
    }
  };

  // تابع سرچ: روی allItems فیلتر کن و نتیجه را در filteredDetailedItems بریز
  const handleSearch = (searchText) => {
    const search = searchText.toLowerCase();
    const filtered = allItems.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(search)
    );
    setFilteredDetailedItems(filtered);
  };

  // دانلود Excel
const handleDownloadExcel = () => {
  if (filteredDetailedItems.length === 0) return;

  const title =
    detailsType === "purchase"
      ? "گزارش_خرید"
      : detailsType === "sale"
      ? "گزارش_توزیع"
      : detailsType === "inventory"
      ? "گزارش_موجودی"
      : "گزارش_کلی";

  const data = filteredDetailedItems.map((item) => {
    if (detailsType === "purchase") {
      return {
        کتگوری: item.category,
        نام_جنس: item.productID,
        تعداد: item.quantityPurchased,
        واحد: item.unit,
        تاریخ: moment(item.purchaseDate).locale("fa").format("jYYYY/jMM/jDD"),
        قیمت_فی: item.pricePerUnit,
        مبلغ: item.totalPurchaseAmount,
      };
    } else if (detailsType === "sale") {
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
    } else if (detailsType === "inventory") {
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


  // دانلود PDF
const handleDownloadPDF = () => {
  if (filteredDetailedItems.length === 0) return;

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
      ? ["نمبر", "کتگوری", "نام محصول", "مقدار", "واحد", "تاریخ", "قیمت فی واحد", "قیمت مجموع", "دیپارتمنت", "توضیحات"]
      : detailsType === "inventory"
      ? ["نمبر", "تاریخ", "نام جنس", "مشخصات", "تعداد", "واحد", "قیمت فیات", "قیمت مجموعی", "کتگوری"]
      : [];

  const data = filteredDetailedItems.map((item) => {
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
        item.productID?.name,
        item.stockSold,
        item.unit,
        moment(item.saleDate).locale("fa").format("jYYYY/jMM/jDD"),
        item.saleAmount,
        item.totalSaleAmount,
        item.department,
        item.description,
      ];
    } else if (detailsType === "inventory") {
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
    } else {
      return [];
    }
  });

  // doc.setFont("helvetica"); // اگر فونت فارسی را لود کردی
  doc.setFontSize(14);
  doc.text(title, 15, 15);

  autoTable(doc,{
    startY: 20,
    head: [headers],
    body: data,
    styles: { fontSize: 10, font: "normal" },
  });

  doc.save(`${title}.pdf`);
};


  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow text-right">
      <h2 className="text-xl font-bold mb-4">گزارش‌گیری</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-4">
        <label className="block mb-1 font-medium">دوره زمانی:</label>
        <Calendar
          value={selectedRange}
          onChange={setSelectedRange}
          shouldHighlightWeekends
          locale="fa"
          colorPrimary="#2563eb"
          calendarClassName="custom-calendar"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">نوع گزارش:</label>
        <select
          className="border rounded w-full py-2"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="">-- انتخاب کنید --</option>
          <option value="purchase">اعاده شده </option>
          <option value="sale">توزیع</option>
          <option value="inventory">موجودی</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        دریافت گزارش
      </button>

      
        <div className="flex justify-between items-center my-4">
          {/* سرچ */}
          <input
            type="text"
            placeholder=" جستجو اجناس..."
            onChange={(e) => handleSearch(e.target.value)}
            className="border p-2 rounded w-1/2"
          />

          {/* دکمه دانلود */}
          <div className="relative">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => setShowDownloadOptions((prev) => !prev)}
            >
              دانلود گزارش
            </button>
            {showDownloadOptions && (
              <div className="absolute left-0 mt-2 bg-white border rounded shadow p-2 z-10">
                <button
                  onClick={handleDownloadExcel}
                  className="block w-full text-right px-2 py-1 hover:bg-gray-100"
                >
                  📊 دانلود Excel
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="block w-full text-right px-2 py-1 hover:bg-gray-100"
                >
                  📄 دانلود PDF
                </button>
              </div>
            )}
          </div>
        </div>
      

      {reportType && filteredDetailedItems.length > 0 && (
        <div className="mt-8 overflow-x-auto bg-white rounded shadow">
          <h3 className="text-lg font-semibold mb-2">
            اجناس{" "}
            {detailsType === "purchase"
              ? "اعاده شده"
              : detailsType === "sale"
              ? "توزیع شده"
              : "موجودی"}
          </h3>

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
              {filteredDetailedItems.map((item, idx) => (
                <tr key={idx}>
                  {detailsType === "purchase" && (
                    <>
                      <td className="px-4 py-2">{item.category}</td>
                      <td className="px-4 py-2">{item.productID}</td>
                      <td className="px-4 py-2">{item.quantityPurchased}</td>
                      <td className="px-4 py-2">{item.unit}</td>
                      <td className="px-4 py-2">
                        {moment(item.purchaseDate).locale("fa").format("jYYYY/jMM/jDD")}
                      </td>
                      <td className="px-4 py-2">{item.pricePerUnit}</td>
                      <td className="px-4 py-2">{item.totalPurchaseAmount}</td>
                    </>
                  )}
                  {detailsType === "sale" && (
                    <>
                      <td className="px-4 py-2">{item.distributedNumber}</td>
                      <td className="px-4 py-2">{item.category}</td>
                      <td className="px-4 py-2">{item.productID?.name}</td>
                      <td className="px-4 py-2">{item.stockSold}</td>
                      <td className="px-4 py-2">{item.unit}</td>
                      <td className="px-4 py-2">
                        {moment(item.saleDate).locale("fa").format("jYYYY/jMM/jDD")}
                      </td>
                      <td className="px-4 py-2">{item.saleAmount}</td>
                      <td className="px-4 py-2">{item.totalSaleAmount}</td>
                      <td className="px-4 py-2">{item.department}</td>
                      <td className="px-4 py-2">{item.description}</td>
                    </>
                  )}
                  {detailsType === "inventory" && (
                    <>
                      <td className="px-4 py-2">{item.ticketserialnumber || "—"}</td>
                      <td className="px-4 py-2">{moment(item.date).locale("fa").format("jYYYY/jMM/jDD")}</td>
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
        </div>
      )}
    </div>
  );
};

export default ReportFilter;

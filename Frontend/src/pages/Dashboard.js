import React, { useContext, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import AuthContext from "../AuthContext";
import { Doughnut } from "react-chartjs-2";
import moment from "moment-jalaali";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const [saleAmount, setSaleAmount] = useState(0);
  const [purchaseAmount, setPurchaseAmount] = useState(0);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [monthlyStockSoldAmounts, setMonthlyStockSoldAmounts] = useState([]);
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState(null);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState(null);
  const [totalPurchaseQuantity, setTotalPurchaseQuantity] = useState(0);

  // برای نمایش نام ماه و تعداد اجناس هر ماه
  const persianMonths = [
    "حمل",
    "ثور",
    "جوزا",
    "سرطان",
    "اسد",
    "سنبله",
    "میزان",
    "عقرب",
    "قوس",
    "جدی",
    "دلو",
    "حوت",
  ];
  // این برای چارت ستونی است
  const currentMonthIndex = Number(moment().format("jM")) - 1;

  const distributedMonthTitle =
    hoveredMonthIndex !== null
      ? persianMonths[hoveredMonthIndex]
      : persianMonths[currentMonthIndex];

  const distributedMonthValue =
    hoveredMonthIndex !== null
      ? monthlyStockSoldAmounts[hoveredMonthIndex] ?? 0
      : monthlyStockSoldAmounts[currentMonthIndex] ?? saleAmount;

  // تابع کمکی برای تبدیل اعداد فارسی به انگلیسی
  const convertPersianToEnglishNumbers = (str) => {
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let result = str;
    persianNumbers.forEach((num, idx) => {
      result = result.replace(new RegExp(num, "g"), englishNumbers[idx]);
    });
    return result;
  };
  const [selectedYear, setSelectedYear] = useState(() => {
    return moment().format("jYYYY"); // سال جاری شمسی به صورت رشته مثلا "1404"
  });
  const authContext = useContext(AuthContext);

  const [chart, setChart] = useState({
    options: {
      chart: {
        id: "monthly-sales-bar",
        toolbar: {
          show: true, // ✅ این خط باعث مخفی شدن منوی سه‌نقطه می‌شود
          offsetX: -50,
        },
        events: {
          dataPointMouseEnter: function (event, chartContext, config) {
            const idx = config.dataPointIndex;
            setHoveredMonthIndex(idx);
          },
          dataPointMouseLeave: function () {
            setHoveredMonthIndex(null);
          },
        },
      },
      title: {
        text: `جدول تصویری توزیع سال ${selectedYear}`,
        align: "center",
        style: {
          fontSize: "18px",
          fontWeight: "bold",
          color: "#374151",
        },
      },

      colors: [
        "#6366f1", // Primary - Indigo
        "#10b981", // Success - Emerald
        "#f59e0b", // Warning - Amber
        "#ef4444", // Danger - Red
        "#3b82f6", // Info - Blue
      ],
      dataLabels: {
        enabled: false, // نمایش مقدار روی نوارها
        style: {
          fontSize: "22px",
          fontWeight: "bold",
          color: "#1f2937", // رنگ تیره‌تر
        },
        offsetY: -10,
        position: "top",
      },
      xaxis: {
        categories: [
          "حمل",
          "ثور",
          "جوزا",
          "سرطان",
          "اسد",
          "سنبله",
          "میزان",
          "عقرب",
          "قوس",
          "جدی",
          "دلو",
          "حوت",
        ],
        labels: {
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            colors: "#111",
          },
        },
      },
      yaxis: {
        title: {
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#111",
          },
        },
      },
      tooltip: {
        enabled: true,
        theme: "dark",
        y: {
          formatter: (val) => `${val} توزیع`,
        },
      },
    },
    series: [{ name: "شمار ثبت‌های توزیع", data: [] }],
  });
  ///////////////////////////
  // چارت دایروی
  //////////////////////////
  const [doughnutData, setDoughnutData] = useState({
    labels: [],
    datasets: [
      {
        label: "تعداد اجناس در هر کتگوری",
        data: [],
        backgroundColor: [
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  });
  ///////////////////////////////////////////////
  // برای رنگ های کارت ها
  const colorClasses = {
    indigo: {
      text: "text-indigo-600",
      bg: "bg-indigo-500",
    },
    blue: {
      text: "text-blue-600",
      bg: "bg-blue-500",
    },
    red: {
      text: "text-red-600",
      bg: "bg-red-500",
    },
  };

  ///////////////////////////////////////////////
  // این برای چارت دایروی است
  const totalStoreCount =
    doughnutData?.datasets?.[0]?.data?.reduce((sum, val) => sum + val, 0) || 0;

  const hoveredStoreTitle =
    hoveredCategoryIndex !== null && doughnutData.labels?.[hoveredCategoryIndex]
      ? `اجناس موجود در کتگوری ${doughnutData.labels[hoveredCategoryIndex]}`
      : "موجودی کل اجناس دیپو";

  const hoveredStoreCount =
    hoveredCategoryIndex !== null &&
    doughnutData.datasets?.[0]?.data?.[hoveredCategoryIndex] !== undefined
      ? doughnutData.datasets[0].data[hoveredCategoryIndex]
      : totalStoreCount;

  const getUserId = () => {
    return typeof authContext.user === "string"
      ? authContext.user.trim()
      : authContext.user?._id?.trim();
  };

  const updateChartData = (counts, amounts) => {
    setChart((prev) => ({
      ...prev,
      series: [{ name: "تعداد رکوردهای توزیع در هر ماه", data: [...counts] }],
    }));

    setMonthlyStockSoldAmounts(amounts);
  };

  /////////////////////////////////////////////////////////////////////
  // تابع برای دریافت مقدار توزیع کل ماه جاری
  /////////////////////////////////////////////////////////////////////

  const fetchCurrentMonthSaleAmount = () => {
    const userId = getUserId();
    if (!userId) return;

    const now = moment(); // تاریخ جاری به شمسی
    const month = now.format("jM"); // گرفتن عدد ماه جاری (مثلاً 1 برای حمل)
    const year = convertPersianToEnglishNumbers(now.format("jYYYY"));

    fetch(
      `http://localhost:4000/api/sales/get/${userId}/monthlysaleamount?month=${month}&year=${year}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSaleAmount(Number(data.totalStockSold || 0)); // ✅ تعداد واقعی اجناس توزیع‌شده
      })

      .catch((err) =>
        console.error("❌ خطا در دریافت مقدار فروش ماه جاری:", err)
      );
  };

  //////////////////////////////////////////////////////////////////////

  const fetchTotalPurchaseQuantity = () => {
    const userId = getUserId();
    if (!userId) return;

    fetch(
      `http://localhost:4000/api/purchase/get/${userId}/totalpurchasequantity`
    )
      .then((res) => res.json())
      .then((data) => setTotalPurchaseQuantity(data.totalPurchaseQuantity || 0))
      .catch((err) =>
        console.error("❌ خطا در دریافت مجموع تعداد اجناس اعاده:", err)
      );
  };

  //////////////////

  const fetchProductsData = () => {
    const userId = getUserId();
    if (!userId) return;

    fetch(`http://localhost:4000/api/product/get/${userId}`)
      .then((res) => res.json())
      .then((data) => setProducts(data || []))
      .catch((err) => console.error("❌ خطا در دریافت محصولات:", err));
  };
  //////////////////////////////////////////////////////////////////////////////
  // چارت ستونی برای نمایش توزیع اجناس در طول سال
  ///////////////////////////////////////////////////////////////

  const fetchMonthlySalesData = () => {
    const userId = getUserId();
    if (!userId || !selectedYear.trim()) return;

    // تبدیل سال فارسی به انگلیسی برای API
    const yearForAPI = convertPersianToEnglishNumbers(selectedYear);

    const url = `http://localhost:4000/api/sales/getmonthly/${userId}?year=${yearForAPI}`;
    console.log("📦 Fetching sales with URL:", url);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // فرض بر این است که API دو آرایه برمی‌گرداند
        if (
          Array.isArray(data.monthlyCounts) &&
          Array.isArray(data.monthlyStockSoldAmounts)
        ) {
          updateChartData(data.monthlyCounts, data.monthlyStockSoldAmounts);
        } else {
          console.warn("❌ داده فروش ماهانه اشتباه است:", data);
        }
      })
      .catch((err) => console.error("❌ خطا در دریافت فروش ماهانه:", err));
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////

  const fetchCategoryStats = () => {
    const userId = getUserId();

    if (!userId) {
      console.warn("❌ شناسه کاربر معتبر نیست.");
      return;
    }

    fetch(`http://localhost:4000/api/inventory/categorystats/${userId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`خطا در پاسخ سرور: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("داده آماری کتگوری دریافت شد:", data);

        if (
          !data ||
          !Array.isArray(data.labels) ||
          !Array.isArray(data.counts) ||
          data.labels.length === 0 ||
          data.counts.length === 0
        ) {
          console.warn("❌ داده آماری دسته‌بندی نامعتبر است:", data);
          return;
        }

        setDoughnutData((prev) => ({
          ...prev,
          labels: data.labels,
          datasets: [
            {
              ...prev.datasets[0],
              data: data.counts,
            },
          ],
        }));
      })
      .catch((err) => {
        console.error("❌ خطا در آمار کتگوری:", err);
      });
  };

  useEffect(() => {
    fetchCurrentMonthSaleAmount();
    fetchTotalPurchaseQuantity();
    fetchProductsData();
    fetchMonthlySalesData();
    fetchCategoryStats();
  }, []);

  useEffect(() => {
    // این useEffect فقط به selectedYear واکنش نشان می‌دهد
    setChart((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        title: {
          ...prev.options.title,
          text: `جدول تصویری توزیع سال ${selectedYear}`,
        },
      },
    }));
    fetchMonthlySalesData();
  }, [selectedYear]);

  return (
    <div className="grid grid-cols-1 col-span-12 lg:col-span-10 gap-6 md:grid-cols-3 lg:grid-cols-3 p-4">
      {/* Cards */}
      {[
        {
          title: `اجناس توزیع شده ماه ${distributedMonthTitle}`,
          value: distributedMonthValue,
          color: "indigo",
        },
        {
          title: hoveredStoreTitle,
          value: hoveredStoreCount,
          color: "blue",
        },
        {
          title: "تعداد مجموع اجناس اعاده شده",
          value: totalPurchaseQuantity,
          color: "red",
        },
      ].map((item, index) => (
        <article
          key={index}
          className="flex flex-col justify-between gap-3 rounded-2xl bg-white shadow-md border border-gray-200 p-6 transition-transform hover:scale-105 hover:shadow-lg duration-300"
        >
          <div className="flex items-center justify-between">
            <strong className="text-lg font-bold text-gray-800">
              {item.title}
            </strong>
            <span className="text-sm text-gray-400">{item.icon}</span>
          </div>
          <p className={`text-3xl font-bold ${colorClasses[item.color].text}`}>
            {item.value}
          </p>
          <div className="h-2 mt-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full w-4/5 ${
                colorClasses[item.color].bg
              } rounded-full`}
            ></div>
          </div>
        </article>
      ))}

      {/* Charts Section */}
      <div className="flex flex-col md:flex-row justify-around items-center bg-white rounded-lg py-8 col-span-full relative">
        {/* 📅 منوی انتخاب سال در گوشه بالا راست */}
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 p-2 ">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className=" py-1 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 font-semibold"
          >
            {Array.from({ length: 21 }, (_, i) => (1400 + i).toString()).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>
        </div>

        {/* 📊 چارت میله‌ای */}
        <div className="mb-6 md:mb-0">
          <Chart
            options={chart.options}
            series={chart.series}
            type="bar"
            width="500"
          />
        </div>

        {/* 🍩 چارت دایره‌ای */}
        <div
          className="flex items-center justify-center"
          style={{ width: "270px", height: "270px" }}
        >
          {doughnutData.labels.length > 0 &&
          doughnutData.datasets[0].data.length > 0 ? (
            <Doughnut
              data={doughnutData}
              options={{
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      font: {
                        size: 18, // سایز بزرگ‌تر
                        weight: "bold", // برای Bold شدن
                      },
                      color: "#111827",
                    },
                  },
                  tooltip: {
                    enabled: true,
                  },
                },
                onHover: (event, elements) => {
                  if (elements.length > 0) {
                    const idx = elements[0].index;
                    setHoveredCategoryIndex(idx);
                  } else {
                    setHoveredCategoryIndex(null);
                  }
                },
              }}
              width={350}
              height={350}
            />
          ) : (
            <p className="text-gray-700 text-center text-base font-bold">
              📊 اطلاعاتی برای چارت دسته‌بندی موجود نیست.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

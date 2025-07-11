import React, { useState, useEffect, useContext } from "react";
import AddSale from "../components/AddSale";
import UpdateSale from "../components/UpdateSale";
import AuthContext from "../AuthContext";

function Sales() {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(true);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (authContext.user) {
      fetchSalesData();
      fetchProductsData();
    }
  }, [updateTrigger, authContext.user]);

  const fetchSalesData = () => {
    fetch(`http://localhost:4000/api/sales/get/${authContext.user._id}`)
      .then((res) => res.json())
      .then((data) => setSales(data))
      .catch((err) => console.error(err));
  };

  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/product/get/${authContext.user._id}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  };
  //////////////////////////////////////////////////////////////////
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleCategoryChange = (e) => setSelectedCategory(e.target.value);

  const filteredSales = sales.filter((sale) => {
    const matchesCategory = selectedCategory
      ? sale.category === selectedCategory
      : true;
    const matchesSearch = searchTerm
      ? sale.productID?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  // اگر پس از فیلتر کردن هیچ داده‌ای نماند، noResults را true کن
  React.useEffect(() => {
    if (searchTerm && filteredSales.length === 0) {
      setNoResults(true);
    } else {
      setNoResults(false);
    }
  }, [searchTerm, filteredSales]);
  //////////////////////////////
  const toggleAddSaleModal = () => setShowSaleModal(!showSaleModal);

  const toggleUpdateSaleModal = (sale) => {
    console.log("Edit clicked:", sale);
    setSelectedSale(sale);
    setShowUpdateModal(true);
  };

  // تابع حذف فروش
  const deleteSaleItem = (id) => {
    if (!id) {
      console.error("شناسه فروش موجود نیست");
      return;
    }

    if (!window.confirm("آیا مطمئن هستید که می‌خواهید این فروش را حذف کنید؟"))
      return;

    fetch(`http://localhost:4000/api/sales/deletesale/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json", // احتیاط: بعضی سرورها بدون این هدر، خطا می‌دهند
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errMessage = await res.text(); // دریافت پیام خطا از بک‌اند
          throw new Error(errMessage || "خطا در حذف فروش");
        }
        return res.json();
      })
      .then(() => {
        setUpdateTrigger((prev) => !prev); // بروزرسانی لیست
        setSelectedSale(null); // پاک‌کردن انتخاب فعلی
      })
      .catch((err) => {
        console.error("خطا در حذف فروش:", err.message);
        alert("خطا در حذف فروش: " + err.message);
      });
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center mt-4">
      <div className="flex flex-col gap-5 w-full px-2 sm:px-4">
        {showSaleModal && (
          <AddSale
            addSaleModalSetting={toggleAddSaleModal}
            products={products}
            handlePageUpdate={() => setUpdateTrigger(!updateTrigger)}
            authContext={authContext}
          />
        )}

        {showUpdateModal && selectedSale && (
          <UpdateSale
            updateProductData={selectedSale} // پراپ درست
            closeModal={() => {
              setShowUpdateModal(false);
              setSelectedSale(null);
            }}
            handlePageUpdate={() => setUpdateTrigger(!updateTrigger)}
          />
        )}

        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
          <div className="flex flex-wrap justify-between items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            {/* عنوان */}
            <span className="text-lg font-bold text-gray-800">توزیع اجناس</span>

            {/* جستجو */}
            <div className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md bg-gray-50 shadow-sm min-w-[200px] sm:max-w-xs flex-grow">
              <img
                alt="search-icon"
                className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform"
                src={require("../assets/search-icon.png")}
                onClick={handleSearchChange}
              />
              <input
                type="text"
                placeholder="جستجو کنید..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
              />
            </div>

            {/* انتخاب کتگوری */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-md shadow-sm border border-gray-200 min-w-[180px]">
              <label className="text-gray-700 font-medium text-sm whitespace-nowrap">
                کتگوری:
              </label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="bg-white border border-gray-300 text-sm text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 py-1 w-full"
              >
                <option value="">همه کتگوری‌ها</option>
                <option value="قرطاسیه">قرطاسیه</option>
                <option value="روغنیات">روغنیات</option>
                <option value="اجناس حفظ و مراقبت">اجناس حفظ و مراقبت</option>
                <option value="اجناس دفتری">اجناس دفتری</option>
                <option value="تجهیزات آیتی">تجهیزات آیتی</option>
              </select>
            </div>

            {/* پیام خطا */}
            {noResults && (
              <p className="w-full text-center text-red-600 text-sm font-medium animate-pulse sm:w-auto">
                ⚠️ جنس مورد نظر یافت نشد.
              </p>
            )}

            {/* دکمه افزودن توزیع */}
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow transition-colors duration-200"
              onClick={toggleAddSaleModal}
            >
              افزودن توزیع
            </button>
          </div>

          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  نمبر توزیع
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  تاریخ
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  نام
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  توضیحات
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  تعداد
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  واحد
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  قیمت فی واحد
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  قیمت مجموع
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  کتگوری
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  اداره
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr
                  key={sale._id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-4 py-3 border text-center text-sm text-gray-700">
                    {sale.distributedNumber}
                  </td>
                  <td className="px-4 py-3 border text-center text-sm text-gray-700">
                    {sale.saleDateShamsi}
                  </td>
                  <td className="px-4 py-3 border text-center text-sm text-gray-700">
                    {sale.productID?.name}
                  </td>
                  <td className="px-4 py-3 border text-center text-sm text-gray-700">
                    {sale.description}
                  </td>
                  <td className="px-4 py-3 border text-center text-sm text-gray-700">
                    {sale.stockSold}
                  </td>
                  <td className="px-4 py-3 border text-center text-sm text-gray-700">
                    {sale.unit}
                  </td>
                  <td className="px-4 py-3 border text-center text-sm text-gray-700">
                    {sale.saleAmount}
                  </td>
                  <td className="px-4 py-3 border text-center text-sm text-gray-700">
                    {sale.totalSaleAmount}
                  </td>
                  <td className="px-4 py-3 border text-center text-sm text-gray-700">
                    {sale.category}
                  </td>
                  <td className="px-4 py-3 border text-center text-sm text-gray-700">
                    {sale.department}
                  </td>
                  <td className="px-4 py-3 border text-center">
                    <div className="flex gap-2 justify-center items-center">
                      <button
                        onClick={() => toggleUpdateSaleModal(sale)}
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition"
                        title="ویرایش"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteSaleItem(sale._id)}
                        className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition"
                        title="حذف"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Sales;

import React, { useState, useEffect, useContext, useMemo } from "react";
import AddPurchaseDetails from "../components/AddPurchaseDetails";
import UpdatePurchase from "../components/UpdatePurchase";
import AuthContext from "../AuthContext";

function PurchaseDetails() {
  const [showPurchaseModal, setPurchaseModal] = useState(false);
  const [purchase, setAllPurchaseData] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatePurchase, setUpdatePurchase] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("");

  const authContext = useContext(AuthContext);

  const fetchPurchaseData = () => {
    const userId = authContext?.user?._id;
    if (!userId) return;

    fetch(`http://localhost:4000/api/purchase/get/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("اجناس اعاده شده", data);
        setAllPurchaseData(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.log("خطا در دریافت اجناس اعاده شده.", err));
  };

  // useEffect بدون شرط در فراخوانی، شرط در داخل هوک است
  useEffect(() => {
    if (!authContext || !authContext.user) return;
    fetchPurchaseData();
  }, [authContext, updatePage]);

  // هوک useMemo همیشه در بالا بدون شرط فراخوانی می‌شود
  const filteredPurchases = useMemo(() => {
    return purchase.filter((item) => {
      const matchesCategory = selectedCategory
        ? item.category === selectedCategory
        : true;
      const matchesSearch = searchTerm
        ? item.productID?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [purchase, selectedCategory, searchTerm]);

  // شرط رندر
  if (!authContext || !authContext.user) {
    return (
      <div className="text-center text-gray-500 p-4">
        در حال بارگذاری اطلاعات کاربر...
      </div>
    );
  }

  const handleSearchTerm = (e) => {
    setSearchTerm(e.target.value);
  };

  const deleteItem = (id) => {
    fetch(`http://localhost:4000/api/purchase/delete/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        console.log("وضعیت پاسخ:", response.status);
        if (!response.ok) throw new Error("خطا در حذف جنس اعاده");
        return response.json();
      })
      .then((data) => {
        console.log("پاسخ موفق:", data);
        alert("حذف موفق✅");
        setUpdatePage((prev) => !prev);
      })
      .catch((err) => {
        console.error("خطا:", err);
        alert("خطا در حذف جنس اعاده");
      });
  };

  const updatePurchaseModalSetting = (item) => {
    setUpdatePurchase(item);
    setShowUpdateModal(true);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div
      dir="rtl"
      className="col-span-12 lg:col-span-10 flex justify-center mt-4"
    >
      <div className="flex flex-col gap-5 w-full px-2 sm:px-4">
        {showPurchaseModal && (
          <AddPurchaseDetails
            addSaleModalSetting={() => setPurchaseModal(false)}
            handlePageUpdate={() => setUpdatePage((prev) => !prev)}
            authContext={authContext}
          />
        )}

        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
          <div className="flex flex-wrap justify-between items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            {/* عنوان */}
            <span className="text-lg font-bold text-gray-800">
              اجناس اعاده شده
            </span>

            {/* جستجو */}
            <div className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md bg-gray-50 shadow-sm min-w-[200px] sm:max-w-xs flex-grow">
              <img
                alt="search-icon"
                className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform"
                src={require("../assets/search-icon.png")}
                onClick={handleSearchTerm}
              />
              <input
                type="text"
                placeholder="جستجو کنید..."
                value={searchTerm}
                onChange={handleSearchTerm}
                className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
              />
            </div>

            {/* انتخاب کتگوری */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-md shadow-sm border border-gray-200 min-w-[180px]">
              <label className="text-gray-700 font-medium text-sm whitespace-nowrap">
                کتگوری:
              </label>
              <select
                id="category"
                name="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="bg-white border border-gray-300 text-sm text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 py-1 w-full"
              >
                <option value="">انتخاب کتگوری</option>
                <option value="قرطاسیه">قرطاسیه</option>
                <option value="روغنیات">روغنیات</option>
                <option value="اجناس حفظ و مراقبت">اجناس حفظ و مراقبت</option>
                <option value="اجناس دفتری">اجناس دفتری</option>
                <option value="تجهیزات آی تی">تجهیزات آی تی</option>
              </select>
            </div>
            {/* پیام خطا */}
            {filteredPurchases.length === 0 && (
              <p className="w-full text-center text-red-600 text-sm font-medium animate-pulse sm:w-auto">
                ⚠️ جنس مورد نظر یافت نشد.
              </p>
            )}

            {/* دکمه افزودن */}
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow transition-colors duration-200"
              onClick={() => setPurchaseModal(true)}
            >
              افزودن جنس اعاده
            </button>
          </div>

          <table className="w-full table-auto text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-800 text-sm font-semibold border-b">
              <tr>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  تاریخ
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  نام جنس
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
                  قیمت مجموعی
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  کتگوری
                </th>

                <th className="px-4 py-3 text-center">عملیات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredPurchases.map((element) => (
                <tr
                  key={element._id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-4 py-2 border text-center">
                    {element.purchaseDateShamsi}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {element.productID}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {element.quantityPurchased}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {element.unit}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {element.pricePerUnit}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {element.totalPurchaseAmount}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {element.category}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => updatePurchaseModalSetting(element)}
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition"
                        title="ویرایش"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteItem(element._id)}
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

      {showUpdateModal && (
        <UpdatePurchase
          purchaseData={updatePurchase}
          updateModalSetting={() => setShowUpdateModal(false)}
          handlePageUpdate={() => setUpdatePage((prev) => !prev)}
        />
      )}
    </div>
  );
}

export default PurchaseDetails;

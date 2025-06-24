
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
  const [updateTrigger, setUpdateTrigger] = useState(true);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (authContext.user) {
      fetchSalesData();
      fetchProductsData();
    }
  }, [updateTrigger, authContext.user]);

  const fetchSalesData = () => {
    fetch(`http://localhost:4000/api/sales/get/${authContext.user}`)
      .then((res) => res.json())
      .then((data) => setSales(data))
      .catch((err) => console.error(err));
  };

  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/product/get/${authContext.user}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleCategoryChange = (e) => setSelectedCategory(e.target.value);

  const filteredSales = sales.filter((sale) => {
    const matchesCategory = selectedCategory ? sale.category === selectedCategory : true;
    const matchesSearch = searchTerm
      ? sale.productID?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

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

  if (!window.confirm("آیا مطمئن هستید که می‌خواهید این فروش را حذف کنید؟")) return;

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
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
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
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 items-center">
              <span className="font-bold">توزیع اجناس</span>

              <div className="flex items-center px-2 border-2 rounded-md">
                <img
                  alt="search-icon"
                  className="w-5 h-5"
                  src={require("../assets/search-icon.png")}
                />
                <input
                  type="text"
                  placeholder="جستجو کنید"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="border-none outline-none px-2 text-sm"
                />
              </div>

              <div className="flex items-center px-2 border-2 rounded-md ml-4 w-48">
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="bg-gray-50 border-none outline-none text-sm w-full"
                >
                  <option value="">همه کتگوری‌ها</option>
                  <option value="قرطاسیه">قرطاسیه</option>
                  <option value="روغنیات">روغنیات</option>
                  <option value="اجناس حفظ و مراقبت">اجناس حفظ و متر</option>
                  <option value="اجناس دفتری">اجناس دفتری</option>
                  <option value="تجهیزات آیتی">تجهیزات آیتی</option>
                </select>
              </div>
            </div>

            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
              onClick={toggleAddSaleModal}
            >
               افزودن توزیع
            </button>
          </div>

          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">نمبر توزیع</th>
                <th className="px-4 py-2 text-left">کتگوری</th>
                <th className="px-4 py-2 text-left">نام جنس</th>
                <th className="px-4 py-2 text-left">مقدار</th>
                <th className="px-4 py-2 text-left">واحد</th>
                <th className="px-4 py-2 text-left">تاریخ</th>
                <th className="px-4 py-2 text-left">قیمت فی واحد</th>
                <th className="px-4 py-2 text-left">قیمت مجموع</th>
                <th className="px-4 py-2 text-left">اداره</th>
                <th className="px-4 py-2 text-left">توضیحات</th>
                <th className="px-4 py-2 text-center">عملیات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale._id}>
                  <td className="px-4 py-2 border">{sale.distributedNumber}</td>
                  <td className="px-4 py-2 border">{sale.category}</td>
                  <td className="px-4 py-2 border">{sale.productID?.name}</td>
                  <td className="px-4 py-2 border">{sale.stockSold}</td>
                  <td className="px-4 py-2 border">{sale.unit}</td>
                  <td className="px-4 py-2 border">{sale.saleDate}</td>
                  <td className="px-4 py-2 border">{sale.saleAmount}</td>
                  <td className="px-4 py-2 border">{sale.totalSaleAmount}</td>
                  <td className="px-4 py-2 border">{sale.department}</td>
                  <td className="px-4 py-2 border">{sale.description}</td>
                  <td className="px-4 py-2 border text-center">
                    <div className="flex gap-3 justify-center items-center">
                      <button
                        onClick={() => toggleUpdateSaleModal(sale)}
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
                        title="ویرایش"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteSaleItem(sale._id)}
                        className="p-2 rounded-full bg-red-100 hover:bg-red-200"
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

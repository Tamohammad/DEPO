import React, { useState, useEffect, useContext } from "react";
import AddPurchaseDetails from "../components/AddPurchaseDetails";
import UpdateProduct from "../components/UpdateProduct";
import AuthContext from "../AuthContext";

function PurchaseDetails() {
  const [showPurchaseModal, setPurchaseModal] = useState(false);
  const [purchase, setAllPurchaseData] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("");

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchPurchaseData();
    fetchProductsData();
  }, [updatePage]);

  // Fetch Purchase Data
  const fetchPurchaseData = () => {
    fetch(`http://localhost:4000/api/purchase/get/${authContext.user}`)
      .then((res) => res.json())
      .then((data) => setAllPurchaseData(data))
      .catch((err) => console.log(err));
  };

  // Fetch Products Data
  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/product/get/${authContext.user}`)
      .then((res) => res.json())
      .then((data) => setAllProducts(data))
      .catch((err) => console.log(err));
  };

  // Search products by term
  // const fetchSearchData = (term) => {
  //   fetch(http://localhost:4000/api/product/search?searchTerm=${term})
  //     .then((res) => res.json())
  //     .then((data) => setAllProducts(data))
  //     .catch((err) => console.log(err));
  // };

  // Search input handler
  const handleSearchTerm = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Delete purchase item
  const deleteItem = (id) => {
    console.log("درخواست حذف با id:", id);
    fetch(`http://localhost:4000/api/purchase/delete/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) throw new Error("خطا در حذف خرید");
        return response.json();
      })
      .then(() => {
        alert("حذف موفق");
        setUpdatePage((prev) => !prev);
      })
      .catch((err) => {
        console.error("خطا:", err);
        alert("خطا در حذف خرید");
      });
  };

  // Update product modal
  const updateProductModalSetting = (product) => {
    setUpdateProduct(product);
    setShowUpdateModal(true);
  };

  // Category change handler
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // فیلتر کردن خریدها بر اساس کتگوری انتخاب‌شده
  const filteredPurchases = purchase.filter((item) => {
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    const matchesSearch = searchTerm
      ? item.productID?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div dir="rtl" className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        {showPurchaseModal && (
          <AddPurchaseDetails
            addSaleModalSetting={() => setPurchaseModal(false)}
            products={products}
            handlePageUpdate={() => setUpdatePage((prev) => !prev)}
            authContext={authContext}
          />
        )}

        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
          <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 px-4 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
            {/* عنوان وسط */}
            <div className="flex-1 text-center md:text-right">
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                ذخیره اقلام اعاده شده
              </span>
            </div>

            {/* باکس جستجو */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-xl shadow-sm">
              <img
                alt="search-icon"
                className="w-5 h-5 opacity-60"
                src={require("../assets/search-icon.png")}
              />
              <input
                type="text"
                placeholder="جستجو کنید"
                value={searchTerm}
                onChange={handleSearchTerm}
                className="bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none"
              />
            </div>

            {/* انتخاب کتگوری */}
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <label className="text-gray-700 font-medium text-sm whitespace-nowrap">
                انتخاب کتگوری:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-gray-300 text-sm text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">انتخاب کتگوری</option>
                <option value="قرطاسیه">قرطاسیه</option>
                <option value="روغنیات">روغنیات</option>
                <option value="اجناس حفظ و مراقبت">اجناس حفظ و مراقبت</option>
                <option value="اجناس دفتری">اجناس دفتری</option>
                <option value="تجهیزات آی تی">تجهیزات آی تی</option>
              </select>
            </div>

            {/* دکمه افزودن داغمه */}
            <div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-sm rounded-xl shadow-sm transition duration-200"
                onClick={() => setPurchaseModal(true)}
              >
                افزودن داغمه
              </button>
            </div>
          </div>

          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  نام جنس
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  تشرحات جنس
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  تعداد
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  واحد
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  تاریخ اعاده
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  قیمت گذاری فی واحد
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  مجموع قیمت گذاری
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  کتگوری
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredPurchases.map((element) => (
                <tr key={element._id}>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    {element.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    {element.discription}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    {element.quantityStock}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    {element.unit}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    {new Date(element.stockDate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    {element.pricePerUnit}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    {element.totleprice}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-900">
                    {element.category}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    <span
                      className="text-green-700 cursor-pointer mx-1"
                      onClick={() => updateProductModalSetting(element)}
                    >
                      ✏️
                    </span>
                    <span
                      className="text-red-600 cursor-pointer mx-1"
                      onClick={() => deleteItem(element._id)}
                    >
                      🗑️
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showUpdateModal && (
        <UpdateProduct
          updateProductData={updateProduct}
          updateModalSetting={() => setShowUpdateModal(false)}
          handlePageUpdate={() => setUpdatePage((prev) => !prev)}
        />
      )}
    </div>
  );
}

export default PurchaseDetails;

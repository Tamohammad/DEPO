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
  //   fetch(`http://localhost:4000/api/product/search?searchTerm=${term}`)
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
  const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
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
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold">جزئیات خرید</span>

              {/* بخش جستجو */}
              <div className="flex justify-center items-center px-2 border-2 rounded-md ">
                <img
                  alt="search-icon"
                  className="w-5 h-5"
                  src={require("../assets/search-icon.png")}
                />
                <input
                  type="text"
                  placeholder="جستجو کنید"
                  value={searchTerm}
                  onChange={handleSearchTerm}
                  className="border-none outline-none px-2 text-sm"
                />
              </div>

              {/* بخش انتخاب کتگوری با استایل مشابه */}
              <div className="flex justify-center items-center px-2 border-2 rounded-md ml-4 w-48">
                {/* اگر آیکون دارید این خط را استفاده کنید، در غیر این صورت حذف کنید */}
                {/* <img
                  alt="category-icon"
                  className="w-5 h-5"
                  src={require("../assets/category-icon.png")}
                /> */}
                <select
  id="category"
  name="category"
  value={selectedCategory}
  onChange={handleCategoryChange}
  className="bg-gray-50 border-none outline-none  text-sm w-full"
>
  <option value="">همه کتگوری ها</option>  {/* این گزینه همه را نشان می‌دهد */}
  <option value="electronics">الکترونیک</option>
  <option value="stationery">لوازم تحریر</option>
  <option value="food">مواد غذایی</option>
  <option value="construction">ساختمانی</option>
</select>

              </div>
            </div>

            <div className="flex gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                onClick={() => setPurchaseModal(true)}
              >
                افزودن خرید
              </button>
            </div>
          </div>

          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  کتگوری
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  نام جنس
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  تعداد خرید
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  واحد
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  تاریخ خرید
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  قیمت فی واحد
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  مجموع مبلغ خرید
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredPurchases.map((element) => (
                <tr key={element._id}>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-900">
                    {element.category}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    {element.productID}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    {element.quantityPurchased}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    {element.unit}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    {new Date(element.purchaseDate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    {element.pricePerUnit}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    {element.totalPurchaseAmount}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-gray-700">
                    <span
                      className="text-green-700 cursor-pointer mx-1"
                      onClick={() => updateProductModalSetting(element)}
                    >
                      Edit
                    </span>
                    <span
                      className="text-red-600 cursor-pointer mx-1"
                      onClick={() => deleteItem(element._id)}
                    >
                      حذف
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

import React, { useState, useEffect, useContext } from "react";
import AddSale from "../components/AddSale";
import AuthContext from "../AuthContext";

function Sales() {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [sales, setAllSalesData] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [updatePage, setUpdatePage] = useState(true);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (authContext.user) {
      fetchSalesData();
      fetchProductsData();
    }
  }, [updatePage, authContext.user]);

  // Fetch Sales Data
  const fetchSalesData = () => {
    fetch(`http://localhost:4000/api/sales/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => setAllSalesData(data))
      .catch((err) => console.log(err));
  };

  // Fetch Products Data
  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/product/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => setAllProducts(data))
      .catch((err) => console.log(err));
  };

  // Search Input Handler
  const handleSearchTerm = (e) => {
    setSearchTerm(e.target.value);
  };

  // Category Change Handler
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Filter Sales by Category and Search Term
  const filteredSaleses = sales.filter((item) => {
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    const matchesSearch = searchTerm
      ? item.productID?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  // Toggle Add Sale Modal
  const addSaleModalSetting = () => {
    setShowSaleModal(!showSaleModal);
  };

  // Trigger Data Reload
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        {showSaleModal && (
          <AddSale
            addSaleModalSetting={addSaleModalSetting}
            products={products}
            handlePageUpdate={handlePageUpdate}
            authContext={authContext}
          />
        )}

        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center">
              <span className="font-bold">توزیع اجناس</span>

              {/* Search Box */}
              <div className="flex justify-center items-center px-2 border-2 rounded-md">
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

              {/* Category Filter */}
              <div className="flex justify-center items-center px-2 border-2 rounded-md ml-4 w-48">
                <select
                  id="category"
                  name="category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="bg-gray-50 border-none outline-none text-sm w-full"
                >
                  <option value="">همه کتگوری ها</option>
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
                onClick={addSaleModalSetting}
              >
                افزودن
              </button>
            </div>
          </div>

          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-900">
                  نمبر توزیع
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">
                  کتگوری
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">
                  نام جنس
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">
                  مقدار
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">
                  واحد
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">
                  تاریخ
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">
                  قیمت فی واحد
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">
                  قیمت مجموع
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">
                  اداره
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-900">
                  توضیحات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredSaleses.map((element) => (
                <tr key={element._id}>
                  <td className="px-4 py-2 text-gray-900">
                    {element.distributedNumber}
                  </td>
                  <td className="px-4 py-2 text-gray-900">
                    {element.category}
                  </td>
                  <td className="px-4 py-2 text-gray-900">
                    {element.productID?.description}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {element.stockSold}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{element.unit}</td>
                  <td className="px-4 py-2 text-gray-700">
                    {element.saleDate}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    ${element.unitPrice}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    ${element.totalSaleAmount}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {element.department}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {element.description}
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

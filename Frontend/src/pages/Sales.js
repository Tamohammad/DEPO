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
    fetchSalesData();
    fetchProductsData();
  }, [updatePage]);

  // Fetching Data of All Sales
  const fetchSalesData = () => {
    fetch(`http://localhost:4000/api/sales/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllSalesData(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching Data of All Products
  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/product/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };

////////////////////////serch function/////////////////////////////////////////

  const handleSearchTerm = (e) => {
  const value = e.target.value;
  setSearchTerm(value);
};





///////////////////////////////////////////////////////////



  // Modal for Sale Add
  const addSaleModalSetting = () => {
    setShowSaleModal(!showSaleModal);
  };

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };


  
  // Category change handler
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
/////////////////////////////////////
  // فیلتر کردن خریدها بر اساس کتگوری انتخاب‌شده
  const filteredSaleses = sales.filter((item) => {
  const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
  const matchesSearch = searchTerm
    ? item.productID?.toLowerCase().includes(searchTerm.toLowerCase())
    : true;
  return matchesCategory && matchesSearch;
});












  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
        {showSaleModal && (
          <AddSale
            addSaleModalSetting={addSaleModalSetting}
            products={products}
            handlePageUpdate={handlePageUpdate}
            authContext={authContext}
          />
        )}
        {/* Table  */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold"> توزیع اجناس</span>

              {/* ////////////////////////////////////////////////////////////////////// */}
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

             {/* ////////////////////////////////////////////////////////////////////// */}
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


    {/* ////////////////////////////////////////////////////////////////////// */}
     
         
            <div className="flex gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                onClick={addSaleModalSetting}
              >
                {/* <Link to="/inventory/add-product">Add Product</Link> */}
                افزودن 
              </button>
            </div>
          </div>
          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
              <th className="px-4 py-2 text-left">
                    نمبر توزیع
                </th>
                <th className="px-4 py-2 text-left">
                    کتگوری
                </th>
                <th className="px-4 py-2 text-left">
                  نام جنس
                </th>
                <th className="px-4 py-2 text-left">
                  مقدار
                </th>
                <th className="px-4 py-2 text-left">
                  واحد
                </th>
                <th className="px-4 py-2 text-left">
                  تاریخ
                </th>
                <th className="px-4 py-2 text-left">
                  قیمت فی واحد
                </th>

                <th className="px-4 py-2 text-left">
                  قیمت مجموع
                </th>
                <th className="px-4 py-2 text-left">
                  اداره
                </th>
                <th className="px-4 py-2 text-left">
                 توضیحات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {sales.map((element, index) => {
                return (
                  <tr key={element._id}>
                  <td className="px-4 py-2 border">
                      {element.distributedNumber}
                    </td>
                    <td className="px-4 py-2 border">
                      {element.category}
                    </td>
                    <td className="px-4 py-2 border">
                      {element.productID?.description}
                    </td>
                    <td className="px-4 py-2 border">
                      {element.stockSold}
                    </td>
                    <td className="px-4 py-2 border">
                      {element.unit}
                    </td>
                    <td className="px-4 py-2 border">
                      {element.saleAmount}
                    </td>
                    <td className="px-4 py-2 border">
                      {element.totalSaleAmount}
                    </td>
                    <td className="px-4 py-2 border">
                      {element.totalSaleAmount}
                    </td>
                    <td className="px-4 py-2 border">
                      {element.department}
                    </td>
                     <td className="px-4 py-2 border">
                      {element.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Sales;

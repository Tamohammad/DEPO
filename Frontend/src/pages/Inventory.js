import React, { useState, useEffect, useContext } from "react";
import AddProduct from "../components/AddProduct";
import UpdateProduct from "../components/UpdateProduct";
import AuthContext from "../AuthContext";

function Inventory() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState();
  const [updatePage, setUpdatePage] = useState(true);
  const [stores, setAllStores] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("A");


  const authContext = useContext(AuthContext);
  console.log('====================================');
  console.log(authContext);
  console.log('====================================');

  useEffect(() => {
    fetchProductsData();
    fetchSalesData();
  }, [updatePage]);

  /*/////////////////////////////////////////////////////////////////////////*/
  useEffect(() => {
    fetchCategoryProducts(selectedCategory); // ✅ نمایش محصولات کتگوری انتخاب‌شده
    fetchSalesData();
  }, [updatePage, selectedCategory]);
/*/////////////////////////////////////////////////////////////////////////*/  

  // Fetching Data of All Products
  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/product/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };
    ///////////////////////////////////////////////////////////////////////////////////
    
  
    const fetchCategoryProducts = (category) => {
      setSelectedCategory(category); // ست کردن کتگوری در UI
      fetch(`http://localhost:4000/api/product/category/${category}/${authContext.user}`)
        .then((res) => res.json())
        .then((data) => {
          setAllProducts(data);
        })
        .catch((err) => console.log(err));
    };
  
    /////////////////////////////////////////////////////////////////////////////////////////////////////
  

  // Fetching Data of Search Products
  const fetchSearchData = () => {
    fetch(`http://localhost:4000/api/product/search?searchTerm=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching all stores data
  const fetchSalesData = () => {
    fetch(`http://localhost:4000/api/store/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllStores(data);
      });
  };

  // Modal for Product ADD
  const addProductModalSetting = () => {
    setShowProductModal(!showProductModal);
  };

  // Modal for Product UPDATE
  const updateProductModalSetting = (selectedProductData) => {
    console.log("Clicked: edit");
    setUpdateProduct(selectedProductData);
    setShowUpdateModal(!showUpdateModal);
  };


  // Delete item
  const deleteItem = (id) => {
    console.log("Product ID: ", id);
    console.log(`http://localhost:4000/api/product/delete/${id}`);
    fetch(`http://localhost:4000/api/product/delete/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setUpdatePage(!updatePage);
      });
  };

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  // Handle Search Term
  const handleSearchTerm = (e) => {
    setSearchTerm(e.target.value);
    fetchSearchData();
  };

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
        <div className="bg-white rounded p-3">
          <span className="font-semibold px-4">فهرست مجموعی</span>
          <div className=" flex flex-col md:flex-row justify-center items-center  ">
{/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////             */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md w-fit">
            <label className="text-gray-800 font-semibold text-sm whitespace-nowrap">
              انتخاب کتگوری:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => fetchCategoryProducts(e.target.value)}
              className="border border-gray-300 bg-gray-50 text-gray-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150"
            >
              <option value="A">کتگوری A</option>
              <option value="B">کتگوری B</option>
              <option value="C">کتگوری C</option>
              <option value="D">کتگوری D</option>
            </select>
          </div>

{/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////             */}
            <div className="flex flex-col gap-3 p-10   w-full  md:w-3/12 sm:border-y-2  md:border-x-2 md:border-y-0">
              <span className="font-semibold text-yellow-600 text-base">
                گودام ها
              </span>
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600 text-base">
                    {stores.length}
                  </span>
                </div>
                
              </div>
            </div>
            <div className="flex flex-col gap-3 p-10  w-full  md:w-3/12  sm:border-y-2 md:border-x-2 md:border-y-0">
              <span className="font-semibold text-purple-600 text-base">
                خروجی ها
              </span>
              <div className="flex gap-8">
      
              </div>
            </div>
            <div className="flex flex-col gap-3 p-10  w-full  md:w-3/12  border-y-2  md:border-x-2 md:border-y-0">
              <span className="font-semibold text-red-600 text-base">
                موجودی
              </span>
              <div className="flex gap-8">
              
              </div>

            </div>
          </div>
        </div>

        {showProductModal && (
          <AddProduct
            addProductModalSetting={addProductModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}
        {showUpdateModal && (
          <UpdateProduct
            updateProductData={updateProduct}
            updateModalSetting={updateProductModalSetting}
          />
        )}

        {/* Table  */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
            <h3 className="font-bold text-gray-800 text-lg">لیست اجناس</h3>              <div className="flex justify-center items-center px-2 border-2 rounded-md ">
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
            </div>
            <div className="flex gap-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded text-sm"
              onClick={addProductModalSetting}
            >
              افزودن جنس جدید
            </button>
            </div>
          </div>
          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  مشخصات جنس
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  تعداد
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  واحد
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  قیمت فیات
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  قیمت مجموعی
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  ملاحظات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {products.map((element, index) => {
                return (
                  <tr key={element._id}>
                    <td className="px-4 py-2 border">
                      {element.description}
                    </td>
                    <td className="px-4 py-2 border">
                      {element.count}
                    </td>
                    <td className="px-4 py-2 border">
                      {element.unit}
                    </td>
                    <td className="px-4 py-2 border">
                      {element.priceperunit}
                    </td>
                    <td className="px-4 py-2 border">
                      {element.totleprice}
                    </td>
                    <td className="px-4 py-2 border">
                      {element.check}
                    </td>

                    <td className="px-4 py-2 border">
                      <span
                        className="text-green-700 cursor-pointer"
                        onClick={() => updateProductModalSetting(element)}
                      >
                        Edit{" "}
                      </span>
                      <span
                        className="text-red-600 px-2 cursor-pointer"
                        onClick={() => deleteItem(element._id)}
                      >
                        Delete
                      </span>
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

export default Inventory;

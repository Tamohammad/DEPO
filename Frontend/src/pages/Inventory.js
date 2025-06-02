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
  const [searchWarning, setSearchWarning] = useState('');

  const [selectedCategory, setSelectedCategory] = useState("A");
  


  const authContext = useContext(AuthContext);
  console.log('====================================');
  console.log(authContext);
  console.log('====================================');

  
  

  {/*/////////////////////////////////////////////////////////////////////////*/}
  useEffect(() => {
    fetchCategoryProducts(selectedCategory); // ✅ نمایش محصولات کتگوری انتخاب‌شده
    fetchSalesData();
  }, [updatePage, selectedCategory]);
{/*/////////////////////////////////////////////////////////////////////////*/ } 

  {/* Fetching Data of All Products*/}
  const fetchSearchData = () => {
    fetch(`http://localhost:4000/api/product/search?searchTerm=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length === 0) {
          setSearchWarning('متأسفانه جنس با این مشخصات یافت نشد.');
          setAllProducts([]); // خالی کردن لیست محصولات
        } else {
          setAllProducts(data);
          setSearchWarning('');
        }
      })
      .catch((err) => {
        console.log(err);
        setSearchWarning('خطا در دریافت اطلاعات');
      });
  };
  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/product/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };
  
  {  /* Handle Search Term*/}  
  const handleSearchTerm = (e) => {
    setSearchTerm(e.target.value);
  };

  

  useEffect(() => {
    fetchProductsData();
    fetchSalesData();
  }, [updatePage]);
   {/* ///////////////////////////////////////////////////////////////////////////////////*/}
    
    const fetchCategoryProducts = (category) => {
      setSelectedCategory(category); // ست کردن کتگوری در UI
      fetch(`http://localhost:4000/api/product/category/${category}/${authContext.user}`)
        .then((res) => res.json())
        .then((data) => {
          setAllProducts(data);
        })
        .catch((err) => console.log(err));
    };
    
  
    {/*/////////////////////////////////////////////////////////////////////////////*/}
  

 
  {/* Fetching all stores data*/}
  const fetchSalesData = () => {
    fetch(`http://localhost:4000/api/store/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllStores(data);
      });
  };

  {/* Modal for Product ADD*/}
  const addProductModalSetting = () => {
    setShowProductModal(!showProductModal);
  };

  {/*Modal for Product UPDATE*/}
  const updateProductModalSetting = (selectedProductData) => {
    console.log("Clicked: edit");
    setUpdateProduct(selectedProductData);
    setShowUpdateModal(!showUpdateModal);
  };


  {/* Delete item*/}
  const deleteItem = (id) => {
    console.log("Product ID: ", id);
    console.log(`http://localhost:4000/api/product/delete/${id}`);
    fetch(`http://localhost:4000/api/product/delete/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setUpdatePage(!updatePage);
      });
  };

{/* Handle Page Update*/}
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };



  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
        <div className="bg-white rounded p-3">
          <span className="font-semibold px-4">فهرست مجموعی</span>
          <div className=" flex flex-col md:flex-row justify-center items-center  ">
{/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////             */}
         
         {/* Add  catagory page */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md w-fit">
                
                <label className="text-gray-800 font-semibold text-sm whitespace-nowrap">
                  انتخاب کتگوری:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => fetchCategoryProducts(e.target.value)}
                  className="border border-gray-300 bg-gray-50 text-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150"
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
          <div className="flex justify-center items-center px-2 border-2 rounded-md">
            <img
              alt="search-icon"
              className="w-5 h-5 hover:cursor-pointer"
              src={require("../assets/search-icon.png")}
              onClick={fetchSearchData}
            />
            <input
              type="text"
              placeholder="جستجو کنید..."
              value={searchTerm}
              onChange={handleSearchTerm}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchSearchData();
              }}
              className="flex-1 bg-transparent outline-none px-2 text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
          {/* نمایش پیام هشدار */}
          {searchWarning && (
            <p className="text-red-500 mt-1 text-sm">{searchWarning}</p>
          )}

              
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
                   کتگوری
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
                      {element.category}
                    </td>
                    <td className="px-4 py-2 border flex gap-3 justify-center items-center">
                      {/* Edit Button */}
                      <button
                        onClick={() => updateProductModalSetting(element)}
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition duration-200"
                        title="ویرایش"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 17h2M12 12v-6m6 6v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2h1" />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteItem(element._id)}
                        className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition duration-200"
                        title="حذف"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
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

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
  const [filteredSales, setFilteredSales] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);



  const authContext = useContext(AuthContext);
  console.log('====================================');
  console.log(authContext);
  console.log('====================================');

  
  // گرفتن تمام محصولات
  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/product/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };

 // گرفتن تمام فروشگاه‌ها
 const fetchSalesData = () => {
  fetch(`http://localhost:4000/api/store/get/${authContext.user}`)
    .then((response) => response.json())
    .then((data) => {
      setAllStores(data);
    });
};

 // فیلتر بر اساس کتگوری
 useEffect(() => {
  if (selectedCategory === "all") {
    setFilteredProducts(products);
  } else {
    const filtered = products.filter(
      (product) => product.category === selectedCategory
    );
    setFilteredProducts(filtered);
  }
}, [selectedCategory, products]);

useEffect(() => {
  fetchProductsData();
  fetchSalesData();
}, [updatePage]);


// جستجوی محصولات
const fetchSearchData = () => {
  fetch(`http://localhost:4000/api/product/search?searchTerm=${searchTerm}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) {
        setSearchWarning('متأسفانه جنس با این مشخصات یافت نشد.');
        setAllProducts([]);
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

 
  
  {  /* Handle Search Term*/}  
  const handleSearchTerm = (e) => {
    setSearchTerm(e.target.value);
  };

  

  useEffect(() => {
    fetchProductsData();
    fetchSalesData();
  }, [updatePage]);
  
  
  
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


  // حذف جنس
  const deleteItem = (id) => {
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
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 bg-gray-50 text-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150"
              >
                <option value="all">همه کتگوری‌ها</option>
                <option value="A">کتگوری A</option>
                <option value="B">کتگوری B</option>
                <option value="C">کتگوری C</option>
                <option value="D">کتگوری D</option>
              </select>
            </div>

{/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////             */}
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
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
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
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchSearchData();
                }}
                className="flex-1 bg-transparent outline-none px-2 text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
            {searchWarning && (
              <p className="text-red-500 mt-1 text-sm">{searchWarning}</p>
            )}
            <div className="flex gap-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded text-sm"
                onClick={() => setShowProductModal(true)}
              >
                افزودن جنس جدید
              </button>
            </div>
          </div>

          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">مشخصات جنس</th>
                <th className="px-4 py-2 text-left">تعداد</th>
                <th className="px-4 py-2 text-left">واحد</th>
                <th className="px-4 py-2 text-left">قیمت فیات</th>
                <th className="px-4 py-2 text-left">قیمت مجموعی</th>
                <th className="px-4 py-2 text-left">کتگوری</th>
                <th className="px-4 py-2 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((element) => (
                <tr key={element._id}>
                  <td className="px-4 py-2 border">{element.description}</td>
                  <td className="px-4 py-2 border">{element.count}</td>
                  <td className="px-4 py-2 border">{element.unit}</td>
                  <td className="px-4 py-2 border">{element.priceperunit}</td>
                  <td className="px-4 py-2 border">{element.totleprice}</td>
                  <td className="px-4 py-2 border">{element.category}</td>
                  <td className="px-4 py-2 border flex gap-3 justify-center items-center">
                    <button
                      onClick={() => {
                        setUpdateProduct(element);
                        setShowUpdateModal(true);
                      }}
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

export default Inventory;

import React, { useState, useEffect, useContext } from "react";
import AddProduct from "../components/AddProduct";
import UpdateProduct from "../components/UpdateProduct";
import AuthContext from "../AuthContext";
import moment from "moment-jalaali";

function Inventory() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState();
  const [updatePage, setUpdatePage] = useState(true);
  const [stores, setAllStores] = useState([]);
  const [searchWarning, setSearchWarning] = useState("");
  const [filteredSales, setFilteredSales] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const authContext = useContext(AuthContext);
  console.log("====================================");
  console.log(authContext);
  console.log("====================================");

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
          setSearchWarning("متأسفانه جنس با این مشخصات یافت نشد.");
          setAllProducts([]);
        } else {
          setAllProducts(data);
          setSearchWarning("");
        }
      })
      .catch((err) => {
        console.log(err);
        setSearchWarning("خطا در دریافت اطلاعات");
      });
  };

  {
    /* Handle Search Term*/
  }
  const handleSearchTerm = (e) => {
    setSearchTerm(e.target.value);
  };

  {
    /* Modal for Product ADD*/
  }
  const addProductModalSetting = () => {
    setShowProductModal(!showProductModal);
  };

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

  {
    /* Handle Page Update*/
  }
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
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
          <div className="flex flex-wrap justify-between items-center gap-4 pt-6 pb-4 px-4 bg-white rounded-xl shadow-md">
            {/* Search box */}
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 shadow-sm transition duration-200 focus-within:ring-2 focus-within:ring-blue-500">
              <img
                alt="search-icon"
                className="w-5 h-5 hover:scale-110 transition-transform duration-200 cursor-pointer"
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
                className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 flex-1"
              />
            </div>

            {/* Warning message */}
            {searchWarning && (
              <p className="text-red-500 text-sm font-medium transition-opacity duration-300 animate-pulse">
                {searchWarning}
              </p>
            )}

            {/* Category selector */}
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

            {/* Add button */}
            <div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow transition duration-200"
                onClick={() => setShowProductModal(true)}
              >
                افزودن جنس
              </button>
            </div>
          </div>

          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">نمبر تکیت</th>
                <th className="px-4 py-2 text-left">تاریخ</th>
                <th className="px-4 py-2 text-left">نام جنس</th>
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
              {filteredProducts.map((element) => {
                // ✅ لاگ بررسی تاریخ

                return (
                  <tr key={element._id}>
                    <td className="px-4 py-2 border">
                      {element.ticketserialnumber || "—"}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {moment(element.date).format("jYYYY-jMM-jDD")}
                    </td>
                    <td className="px-4 py-2 border">{element.name}</td>
                    <td className="px-4 py-2 border">{element.description}</td>
                    <td className="px-4 py-2 border">{element.count}</td>
                    <td className="px-4 py-2 border">{element.unit}</td>
                    <td className="px-4 py-2 border">{element.priceperunit}</td>
                    <td className="px-4 py-2 border">{element.totalPrice}</td>
                    <td className="px-4 py-2 border">{element.category}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex gap-3 justify-center items-center">
                        <button
                          onClick={() => {
                            setUpdateProduct(element);
                            setShowUpdateModal(true);
                          }}
                          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition"
                          title="ویرایش"
                        >
                          ✏
                        </button>
                        <button
                          onClick={() => deleteItem(element._id)}
                          className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition"
                          title="حذف"
                        >
                          🗑
                        </button>
                      </div>
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

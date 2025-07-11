import React, { useState, useEffect, useContext } from "react";
import AddProduct from "../components/AddProduct";
import UpdateProduct from "../components/UpdateProduct";
import AuthContext from "../AuthContext";
import moment from "moment-jalaali";
moment.loadPersian({ dialect: "persian-modern", usePersianDigits: true });

function Inventory() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatePage, setUpdatePage] = useState(true);
  const [searchWarning, setSearchWarning] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (authContext.user) {
      fetchProductsData();
    }
  }, [updatePage]);

  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/product/get/${authContext.user._id}`)
      .then((response) => response.json())
      .then((data) => setAllProducts(data))
      .catch((err) => console.log(err));
  };

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
  }, [updatePage]);

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

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchSearchData();
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const addProductModalSetting = () => {
    setShowProductModal(!showProductModal);
  };

  const updateProductModalSetting = (selectedProductData) => {
    setUpdateProduct(selectedProductData);
    setShowUpdateModal(!showUpdateModal);
  };

  const deleteItem = (id) => {
    fetch(`http://localhost:4000/api/product/delete/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("حذف موفق نبود");
        return response.json();
      })
      .then(() => {
        alert("محصول با موفقیت حذف شد ✅");
        setUpdatePage((prev) => !prev);
      })
      .catch((error) => {
        alert("خطا در حذف محصول ❌: " + error.message);
      });
  };

  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center mt-4">
      <div className="flex flex-col gap-5 w-full px-2 sm:px-4">
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

        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
          <div className="flex flex-wrap justify-between items-center gap-4 pt-5 pb-3 px-4 bg-white rounded-xl shadow-sm">
            {/* عنوان صفحه */}
            <span className="text-lg font-bold text-gray-800">
              مدیریت اجناس
            </span>

            {/* جستجو */}
            <div className="flex items-center border-2 border-gray-300 rounded-md px-3 py-1 bg-gray-50 w-full max-w-xs">
              <img
                alt="search-icon"
                className="w-5 h-5"
                src={require("../assets/search-icon.png")}
                onClick={fetchSearchData}
              />
              <input
                type="text"
                placeholder="جستجو کنید"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchSearchData();
                }}
                className="ml-2 flex-grow bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* فیلتر کتگوری */}
            <div className="flex items-center border-2 border-gray-300 rounded-md px-3 py-1 bg-gray-50 w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-50 border-none outline-none text-sm w-full text-gray-700"
              >
                <option value="all">همه کتگوری‌ها</option>
                <option value="قرطاسیه">قرطاسیه</option>
                <option value="روغنیات">روغنیات</option>
                <option value="اجناس حفظ و مراقبت">اجناس حفظ و مراقبت</option>
                <option value="اجناس دفتری">اجناس دفتری</option>
                <option value="تجهیزات آی تی">تجهیزات آی تی</option>
              </select>
            </div>

            {/* هشدار جستجو در صورت نیاز */}
            {searchWarning && (
              <p className="text-sm text-red-600 animate-pulse w-full sm:w-auto mt-2">
                ⚠️ {searchWarning}
              </p>
            )}

            {/* دکمه افزودن جنس */}
            <button
              onClick={() => setShowProductModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow transition-colors duration-200"
            >
              افزودن جنس
            </button>
          </div>

          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  نمبر تکت
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  تاریخ
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  نام
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  مشخصات جنس
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  تعداد
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  واحد
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  قیمت فیات
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  قیمت مجموعی
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  کتگوری
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((element) => (
                <tr
                  key={element._id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-4 py-2 border text-center">
                    {element.ticketserialnumber}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {element.ProductDateShamsi}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {element.name}
                  </td>
                  <td className="px-4 py-2 border text-right">
                    {element.description}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {element.count}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {element.unit}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {element.priceperunit}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {element.totalPrice}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {element.category}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <div className="flex gap-2 justify-center items-center">
                      <button
                        onClick={() => {
                          setUpdateProduct(element);
                          setShowUpdateModal(true);
                        }}
                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
                        title="ویرایش"
                      >
                        ✏️
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

export default Inventory;

import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import moment from "moment-jalaali";
import DateObject from "react-date-object";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
/////////////////////////////////////////
function convertPersianDigitsToEnglish(str) {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return str.replace(/[۰-۹]/g, (d) => persianDigits.indexOf(d));
}
////////////////////////////////////////////////////
// تبدیل رشته ISO میلادی به DateObject شمسی برای DatePicker
const convertISOToPersianDateObject = (isoDateString) => {
  if (!isoDateString) return null;
  const m = moment(isoDateString);
  const jy = m.jYear();
  const jm = m.jMonth() + 1;
  const jd = m.jDate();

  return new DateObject({
    year: jy,
    month: jm,
    day: jd,
    calendar: persian,
    locale: persian_fa,
  });
};

export default function UpdateSales({
  updateProductData,
  closeModal,
  handlePageUpdate,
}) {
  const {
    _id,
    productID,
    distributedNumber,
    category,
    stockSold,
    unit,
    saleAmount,
    totalSaleAmount,
    department,
    saleDate,
    description,
  } = updateProductData;

  const [sale, setSale] = useState({
    _id,
    productID,
    distributedNumber,
    category,
    stockSold,
    unit,
    saleAmount,
    totalSaleAmount,
    department,
    saleDate: convertISOToPersianDateObject(saleDate),
    description,
  });
  const selectedProductId =
    typeof sale.productID === "object" ? sale.productID?._id : sale.productID;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // دریافت inventory
        const inventoryRes = await fetch("http://localhost:4000/api/inventory");
        if (!inventoryRes.ok) {
          throw new Error(`خطا در دریافت inventory: ${inventoryRes.status}`);
        }
        const inventoryData = await inventoryRes.json();
        setProducts(inventoryData);

        // استخراج دسته‌بندی و واحد از inventory
        const uniqueCategories = [
          ...new Set(inventoryData.map((item) => item.category)),
        ];
        const uniqueUnits = [
          ...new Set(inventoryData.map((item) => item.unit)),
        ];
        setCategories(uniqueCategories);
        setUnits(uniqueUnits);

        // دریافت فقط دپارتمان‌ها
        const departmentsRes = await fetch(
          "http://localhost:4000/api/sales/departments"
        );
        if (!departmentsRes.ok) {
          throw new Error(
            `خطا در دریافت departments: ${departmentsRes.status}`
          );
        }
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData);
      } catch (error) {
        console.error("خطا در دریافت اطلاعات:", error);
      }
    };

    fetchData();
  }, []);

  // محاسبه قیمت مجموعی
  useEffect(() => {
    const quantity = parseFloat(sale.stockSold);
    const unitPrice = parseFloat(sale.saleAmount);
    if (!isNaN(quantity) && !isNaN(unitPrice)) {
      const total = quantity * unitPrice;
      setSale((prev) => ({
        ...prev,
        totalSaleAmount: total.toFixed(2),
      }));
    }
  }, [sale.stockSold, sale.saleAmount]);

  const handleInputChange = (key, value) => {
    setSale({ ...sale, [key]: value });
  };

  const handleProductChange = (productId) => {
    const selectedProduct = products.find((p) => p.productId === productId);
    if (selectedProduct) {
      setSale((prev) => ({
        ...prev,
        productID: productId,
        unit: selectedProduct.unit,
        category: selectedProduct.category,
        department: selectedProduct.department,
      }));
    } else {
      setSale((prev) => ({
        ...prev,
        productID: productId,
      }));
    }
  };
  const updateSales = async () => {
    try {
      let saleDateString = null;

      if (sale.saleDate) {
        if (typeof sale.saleDate.format === "function") {
          // تبدیل به رشته شمسی "YYYY/MM/DD"
          saleDateString = convertPersianDigitsToEnglish(
            sale.saleDate.format("YYYY/MM/DD")
          );
        } else if (typeof sale.saleDate === "string") {
          saleDateString = convertPersianDigitsToEnglish(sale.saleDate);
        }
      }

      const saleDataToSend = {
        ...sale,
        saleDate: saleDateString,
      };

      const response = await fetch(
        `http://localhost:4000/api/sales/update/${sale._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(saleDataToSend),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("توزیع با موفقیت آپدیت شد");
        handlePageUpdate();
        setOpen(false);
        closeModal();
      } else {
        console.error("خطا از سمت سرور:", result);
        alert(
          "خطا در هنگام توزیع " + (result.message || JSON.stringify(result))
        );
      }
    } catch (error) {
      console.error("خطا:", error);
      alert("مشکلی در ارتباط با سرور رخ داده است.");
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold text-gray-900 text-right py-4"
                  >
                    ویرایش فروش
                  </Dialog.Title>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateSales();
                    }}
                    className="grid gap-4 mb-4 sm:grid-cols-2"
                    dir="rtl"
                  >
                    {/* شماره توزیع */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 text-right">
                        شماره توزیع
                      </label>
                      <input
                        type="text"
                        value={sale.distributedNumber}
                        onChange={(e) =>
                          handleInputChange("distributedNumber", e.target.value)
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                      />
                    </div>

                    {/* نام جنس */}
                    <div>
                      <select
                        value={selectedProductId}
                        onChange={(e) => handleProductChange(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                      >
                        {/* اگر محصول قبلی در لیست نیست، آن را به صورت دستی نمایش بده */}
                        {!products.some(
                          (p) =>
                            String(p.productId) === String(selectedProductId)
                        ) &&
                          selectedProductId && (
                            <option value={selectedProductId}>
                              {typeof sale.productID === "object"
                                ? sale.productID.name
                                : "📦 محصول قبلی (ناموجود در لیست)"}
                            </option>
                          )}
                        <option value="">یک جنس انتخاب کنید</option>
                        {products.map((product) => (
                          <option key={product._id} value={product.productId}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* کتگوری */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 text-right">
                        کتگوری
                      </label>
                      <select
                        value={sale.category}
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                      >
                        <option value="">انتخاب کنید</option>
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* واحد */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 text-right">
                        واحد
                      </label>
                      <select
                        value={sale.unit}
                        onChange={(e) =>
                          handleInputChange("unit", e.target.value)
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                      >
                        <option value="">انتخاب کنید</option>
                        {units.map((u, idx) => (
                          <option key={idx} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* اداره دریافت‌کننده */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 text-right">
                        اداره دریافت‌کننده
                      </label>
                      <select
                        value={sale.department}
                        onChange={(e) =>
                          handleInputChange("department", e.target.value)
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                      >
                        <option value="">انتخاب کنید</option>
                        {departments.map((dep, idx) => (
                          <option key={idx} value={dep}>
                            {dep}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* تعداد */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 text-right">
                        تعداد
                      </label>
                      <input
                        type="number"
                        value={sale.stockSold}
                        onChange={(e) =>
                          handleInputChange("stockSold", e.target.value)
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                      />
                    </div>

                    {/* قیمت فی واحد */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 text-right">
                        قیمت فی واحد
                      </label>
                      <input
                        type="number"
                        value={sale.saleAmount}
                        onChange={(e) =>
                          handleInputChange("saleAmount", e.target.value)
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                      />
                    </div>

                    {/* قیمت مجموعی */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 text-right">
                        قیمت مجموعی
                      </label>
                      <input
                        type="text"
                        value={sale.totalSaleAmount}
                        disabled
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                      />
                    </div>

                    {/* تاریخ */}

                    <div className="h-fit w-fit">
                      <label
                        className="block mb-2 text-sm font-medium text-gray-900 text-right"
                        htmlFor="salesDate"
                      >
                        تاریخ
                      </label>
                      <DatePicker
                        calendar={persian}
                        locale={persian_fa}
                        value={sale.saleDate}
                        onChange={(date) => handleInputChange("saleDate", date)}
                        format="YYYY/MM/DD"
                        inputClass="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                        placeholder="تاریخ را انتخاب کنید"
                      />
                    </div>
                    {/* توضیحات */}
                    <div className="sm:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-900 text-right">
                        توضیحات
                      </label>
                      <textarea
                        value={sale.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        className="bg-gray-50 border border-gray-300 rounded-lg text-sm w-full text-right p-2 min-h-[80px]"
                        placeholder="توضیحات را وارد کنید"
                      />
                    </div>

                    {/* دکمه‌ها */}
                    <div className="sm:col-span-2 flex justify-end space-x-2 space-x-reverse mt-4">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded"
                      >
                        ذخیره آپدیت
                      </button>
                      <button
                        type="button"
                        onClick={closeModal}
                        ref={cancelButtonRef}
                        className="bg-white border border-gray-300 text-gray-900 font-semibold py-2 px-4 rounded hover:bg-gray-100"
                      >
                        لغو
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

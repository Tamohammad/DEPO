import React, { Fragment, useRef, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
// import Sales from "../pages/Sales";
/////////////////////////////////////////////////////
function convertPersianDigitsToEnglish(str) {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return str.replace(/[۰-۹]/g, (d) => persianDigits.indexOf(d));
}
///////////////////////////////////////////
export default function AddSale({
  addSaleModalSetting,
  handlePageUpdate,
  authContext,
}) {
  const [sale, setSale] = useState({
    userID: authContext.user,
    distributedNumber: "",
    category: "",
    productID: "",
    stockSold: "",
    unit: "",
    saleAmount: "",
    totalSaleAmount: "",
    department: "",
    saleDate: null,
    description: "",
  });
  const [inventoryItems, setInventoryItems] = useState([]);
  const [productName, setProductName] = useState("");
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  //در یافت دیتا از موجودی
  //////////////////////////////////////////////////////////
  useEffect(() => {
    if (authContext.user && authContext.user._id) {
      console.log("📦 درخواست موجودی برای یوزر:", authContext.user._id);
      fetch(`http://localhost:4000/api/inventory/get/${authContext.user._id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("✅ موجودی دریافت‌شده:", data);
          setInventoryItems(data);
        })
        .catch((err) => {
          console.error("❌ خطا در دریافت موجودی:", err);
        });
    }
  }, [authContext.user]); // 👈 اضافه کردن وابستگی

  //////////////////////////////////////////////////////////////////

  // محاسبه خودکار مجموع مبلغ خرید

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

  // Handling Input Change for input field
  const handleInputChange = (name, value) => {
    setSale((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //////////////////////////////بعدا اضافه شوده مربوط سرچ میشود/////
  const handleProductChangeByName = (name) => {
    setProductName(name);
    const selected = inventoryItems.find((item) => item.name === name);

    if (selected) {
      setSale((prev) => ({
        ...prev,
        productID: selected.productId,
        unit: selected.unit,
        category: selected.category,
      }));
    } else {
      setSale((prev) => ({
        ...prev,
        productID: "",
        unit: "",
        category: "",
      }));
    }
  };

  /////////////////////////////////////////////////////////////
  const addSale = () => {
    //////////////////////////////
    // 👇 بررسی اینکه تمام فیلدهای ضروری پر هستند
    const requiredFields = {
      userID: "شناسه کاربر",
      distributedNumber: "شماره توزیع",
      category: "دسته‌بندی",
      productID: "شناسه محصول",
      stockSold: "مقدار فروش رفته",
      unit: "واحد",
      saleAmount: "مبلغ فروش",
      totalSaleAmount: "مبلغ کل فروش",
      department: "دپارتمان",
      saleDate: "تاریخ فروش",
      description: "توضیحات",
    };

    for (let field in requiredFields) {
      if (
        sale[field] === "" ||
        sale[field] === null ||
        sale[field] === undefined
      ) {
        alert(`فیلد "${requiredFields[field]}" خالی است. لطفاً آن را پر کنید.`);
        return;
      }
    }
    /////////////////////////////
    // تبدیل تاریخ به رشته اگر وجود دارد
    const saleDateString = sale.saleDate
      ? convertPersianDigitsToEnglish(sale.saleDate.format("YYYY/MM/DD"))
      : null;
    const saleDataToSend = {
      ...sale,
      saleDate: saleDateString,
    };

    fetch("http://localhost:4000/api/sales/add", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(saleDataToSend),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.error || "خطای سرور");
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ پاسخ سرور:", data);
        if (data.message) {
          alert(data.message);
        } else {
          alert("✅ توزیع ثبت شد، اما پیام دریافت نشد.");
        }

        handlePageUpdate();
        addSaleModalSetting();
      })
      .catch((err) => {
        console.error("❌ خطا:", err.message);
        alert("❌ خطا در ثبت توزیع: " + err.message);
      });
  };

  //////////////////////////////////////////////////////

  return (
    // Modal
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
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 ">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg overflow-y-scroll">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PlusIcon
                        className="h-6 w-6 text-blue-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-right ">
                      <Dialog.Title
                        as="h3"
                        className="text-right text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-4"
                      >
                        افزودن توزیع
                      </Dialog.Title>

                      <form action="#">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                          {/* انتخاب نمبر توزیغ */}
                          <div>
                            <label
                              htmlFor="disterbutedNumber"
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                            >
                              نمبر توزیع
                            </label>
                            <input
                              type="number"
                              name="distributedNumber"
                              id="distributedNumber"
                              value={sale.distributedNumber}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                              placeholder="نمبر توزیع را وارید کنید"
                            />
                          </div>

                          {/* انتخاب کتگوری */}
                          <div>
                            <label
                              htmlFor="category"
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                            >
                              کتگوری
                            </label>
                            <select
                              id="category"
                              name="category"
                              value={sale.category}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                            >
                              <option value="">انتخاب کتگوری</option>
                              <option value="قرطاسیه">قرطاسیه</option>
                              <option value="روغنیات">روغنیات</option>
                              <option value="اجناس حفظ و مراقبت">
                                اجناس حفظ و مراقبت
                              </option>
                              <option value="اجناس دفتری">اجناس دفتری</option>
                              <option value="تجهیزات آیتی">تجهیزات آیتی</option>
                            </select>
                          </div>

                          <div className="mb-4">
                            <input
                              list="products"
                              placeholder="جستجوی نام محصول..."
                              value={productName}
                              onChange={(e) =>
                                handleProductChangeByName(e.target.value)
                              }
                              className="w-full p-2 border rounded"
                            />

                            <datalist id="products">
                              {inventoryItems.map((item) => (
                                <option
                                  key={item.productId}
                                  value={item.name}
                                />
                              ))}
                            </datalist>
                          </div>

                          <div>
                            <label
                              htmlFor="stockSold"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-right "
                            >
                              مقدار
                            </label>
                            <input
                              type="number"
                              name="stockSold"
                              id="stockSold"
                              value={sale.stockSold}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 text-right"
                              placeholder="مقدار جنس را وارد کنید"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="unit"
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                            >
                              واحد
                            </label>
                            <select
                              id="unit"
                              name="unit"
                              value={sale.unit}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                            >
                              <option value="">انتخاب واحد</option>
                              <option value="کیلوگرام">کیلوگرام</option>
                              <option value="لیتر">لیتر</option>
                              <option value="عدد">عدد</option>
                              <option value="متر">متر</option>
                              <option value="جعبه">جعبه</option>
                              <option value="بسته">بسته</option>
                              <option value="گده">گده</option>
                              <option value="دانه">دانه</option>
                              <option value="تیوب">تیوب</option>
                              <option value="رول">رول</option>
                              <option value="طفرا">طفرا</option>
                              <option value="باب">باب</option>
                              <option value="عراده">عراده</option>
                              <option value="پایه">پایه</option>
                              <option value="کواتر">کواتر</option>
                              <option value="قوطی">قوطی</option>
                              <option value="جلد">جلد</option>
                              <option value="خاده">خاده</option>
                              <option value="قطعه">قطعه</option>
                              <option value="کارتن">کارتن</option>
                              <option value="بشکه">بشکه</option>
                              <option value="دسته">دسته</option>
                              <option value="پاکت">پاکت</option>
                              <option value="توتل">توتل</option>
                              <option value="سیت">سیت</option>
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="totalSaleAmount"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-right"
                            >
                              قیمت فی واحد
                            </label>
                            <input
                              type="number"
                              name="saleAmount"
                              id="price"
                              value={sale.saleAmount}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 text-right"
                              placeholder="قیمت فی واحد"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="unit"
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                            >
                              اداره تحویل گیرنده
                            </label>
                            <select
                              id="department"
                              name="department"
                              value={sale.department}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                            >
                              <option value="">انتخاب کنید</option>

                              <optgroup label="پوهنځی انجنیری صنایع کیمیاوی">
                                <option value="تکنالوژی مواد عضوی">
                                  تکنالوژی مواد عضوی
                                </option>
                                <option value="تکنالوژی مواد غیر عضوی">
                                  تکنالوژی مواد غیر عضوی
                                </option>
                                <option value="تکنالوژی مواد غذایی">
                                  تکنالوژی مواد غذایی
                                </option>
                                <option value="تکنالوژی پروسس فلزات">
                                  تکنالوژی پروسس فلزات
                                </option>
                              </optgroup>

                              <optgroup label="پوهنځی ساختمانی">
                                <option value="ساختمان های صنعتی و مدنی">
                                  ساختمان های صنعتی و مدنی
                                </option>
                                <option value="مهندسی">مهندسی</option>
                                <option value="شهر سازی">شهر سازی</option>
                                <option value="مدیریت و انجنیری ساختمان">
                                  مدیریت و انجنیری ساختمان
                                </option>
                                <option value="رسم تخنیکی و هندسه ترسیمی">
                                  رسم تخنیکی و هندسه ترسیمی
                                </option>
                              </optgroup>

                              <optgroup label="پوهنځی الکترومیخانیک">
                                <option value="انجنیری اتومیخانیک">
                                  انجنیری اتومیخانیک
                                </option>
                                <option value="تامین برق موسسات صنعتی، شهرها و دهات">
                                  تامین برق موسسات صنعتی، شهرها و دهات
                                </option>
                              </optgroup>

                              <optgroup label="پوهنځی کمپیوترساینس">
                                <option value="سیستم های معلوماتی ">
                                  سیستم های معلوماتی{" "}
                                </option>
                                <option value="انجنیری کمپیوتر">
                                  انجنیری کمپیوتر
                                </option>
                                <option value="انجنیری شبکه ">
                                  انجنیری شبکه
                                </option>
                              </optgroup>
                              <optgroup label="  پوهنځی جيولوجي ومعدن">
                                <option value=" انجنیری جیولوجی و اکشاف معادن">
                                  {" "}
                                  انجنیری جیولوجی و اکشاف معادن
                                </option>
                                <option value=" انجنیری معادن نفت و گاز">
                                  {" "}
                                  انجنیری معادن نفت و گاز
                                </option>
                                <option value=" انجنیری استخراج معادن مواد مفید جامد به طریقه برهنه">
                                  {" "}
                                  انجنیری استخراج معادن مواد مفید جامد به طریقه
                                  برهنه
                                </option>
                                <option value="انجنیری استخراج معادن مواد مفید جامد به طریقه زیرزمینی">
                                  {" "}
                                  انجنیری استخراج معادن مواد مفید جامد به طریقه
                                  زیرزمینی
                                </option>
                                <option value="جیولوجی انجنیری وهایدروجیولوجی">
                                  جیولوجی انجنیری وهایدروجیولوجی
                                </option>
                              </optgroup>

                              <optgroup label="پوهنځی انجنیری آب و محیط زیست">
                                <option value="انجنیری ساختمان های آب">
                                  انجنیری ساختمان های آب
                                </option>
                                <option value="آبرسانی و انجنیری محیط زیست">
                                  آبرسانی و انجنیری محیط زیست
                                </option>
                              </optgroup>

                              <optgroup label="پوهنځی انجنیری ساختمانهای ترانسپورتی">
                                <option value=" انجنیری ساختمان های ترانسپورتی">
                                  {" "}
                                  انجنیری ساختمان های ترانسپورتی
                                </option>
                                <option value="انجنیری راه آهن">
                                  انجنیری راه آهن
                                </option>
                              </optgroup>

                              <optgroup label="پوهنځی انجنیری جیوماتیک">
                                <option value="سیستم اطلاعات جغرافیایی و سنجش از دور">
                                  سیستم اطلاعات جغرافیایی و سنجش از دور
                                </option>
                                <option value="دیپارتمنت کدستر ">
                                  دیپارتمنت کدستر{" "}
                                </option>
                                <option value="دیپارتمنت جیودیزی ">
                                  {" "}
                                  دیپارتمنت جیودیزی{" "}
                                </option>
                                <option value="دیپارتمنت جیودیزی انجنیری ">
                                  {" "}
                                  دیپارتمنت جیودیزی انجنیری{" "}
                                </option>
                              </optgroup>

                              <optgroup label=" دیپارتمنت های عمومی">
                                <option value="فزیک">فزیک</option>
                                <option value="ریاضی">ریاضی</option>
                                <option value="کیمیا">کیمیا</option>
                                <option value=" ثقافت"> ثقافت</option>
                              </optgroup>
                            </select>
                          </div>

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
                              onChange={(date) =>
                                handleInputChange("saleDate", date)
                              }
                              format="YYYY/MM/DD"
                              inputClass="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                              placeholder="تاریخ را انتخاب کنید"
                            />
                          </div>
                          {/* توضیحات */}

                          <div className="sm:col-span-2 text-right">
                            <label
                              htmlFor="description"
                              className="block mb-2 text-sm font-medium text-gray-900"
                            >
                              مشخصات جنس
                            </label>
                            <textarea
                              id="description"
                              name="description"
                              rows="4"
                              value={sale.description}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="block w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300"
                              placeholder="شرحی بنویسید..."
                              dir="rtl"
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 flex justify-end gap-3 rounded-b-lg shadow-inner">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={addSale}
                  >
                    افزودن
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 shadow-sm transition duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    onClick={addSaleModalSetting}
                    ref={cancelButtonRef}
                  >
                    لغو
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

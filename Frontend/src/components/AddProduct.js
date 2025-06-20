import { Fragment, useContext, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AuthContext from "../AuthContext";

export default function AddProduct({
  addProductModalSetting,
  handlePageUpdate,
}) {
  const authContext = useContext(AuthContext);

  // تاریخ امروز به فرمت YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  const [product, setProduct] = useState({
    userId: authContext.user,
    ticketserialnumber: "",
    date: today, // مقدار پیش‌فرض تاریخ امروز
    name: "",
    description: "",
    count: "",
    unit: "",
    priceperunit: "",
    category: "",
  });

  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  const handleInputChange = (key, value) => {
    setProduct((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addProduct = async () => {
    const parsedCount = parseFloat(product.count);
    const parsedPrice = parseFloat(product.priceperunit);

    if (isNaN(parsedCount) || isNaN(parsedPrice)) {
      alert("⚠️ لطفاً عدد معتبر برای تعداد و قیمت وارد کنید.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/product/add", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          ...product,
          count: parsedCount,
          priceperunit: parsedPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطا در افزودن جنس");
      }

      if (data.message.includes("جدید")) {
        alert("✅ جنس جدید با موفقیت اضافه شد.");
      } else if (data.message.includes("موجود بود")) {
        alert("🔁 جنس موجود بود، قیمت و تعداد آن بروزرسانی شد.");
      }

      handlePageUpdate();
      addProductModalSetting();
    } catch (err) {
      console.error("❌ خطا در افزودن جنس:", err);
      alert("⚠️ خطا در افزودن جنس. لطفاً دوباره تلاش کنید.");
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
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PlusIcon
                        className="h-6 w-6 text-blue-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-right text-lg font-semibold leading-6 text-gray-900"
                      >
                        اضافه کردن محصول
                      </Dialog.Title>
                      <form action="#">
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          <div className="text-right">
                            <label
                              htmlFor="price"
                              className="block mb-1 text-sm font-medium text-gray-900"
                            >
                              نمبر تکیت
                            </label>
                            <input
                              type="number"
                              name="ticketserialnumber"
                              id="ticketserialnumber"
                              value={product.ticketserialnumber}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                              placeholder="نمبر تکیت را بنوسید..."
                            />
                          </div>
                          <div className="h-fit w-fit">
                            {/* <Datepicker
                              onChange={handleChange}
                              show={show}
                              setShow={handleClose}
                            /> */}
                            <label
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                              htmlFor="sDate"
                            >
                              تاریخ
                            </label>
                            <input
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                              type="date"
                              id="date"
                              name="date"
                              value={product.date}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            />
                          </div>
                          <div className="text-right">
                            <label
                              htmlFor="name"
                              className="block mb-1 text-sm font-medium text-gray-900"
                            >
                              نام جنس
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={product.name}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                              placeholder="نام جنس را وارد کنید..."
                            />
                          </div>

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
                              value={product.description}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="block w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300"
                              placeholder="شرحی بنویسید..."
                              dir="rtl"
                            />
                          </div>
                          <div className="text-right">
                            <label
                              htmlFor="price"
                              className="block mb-1 text-sm font-medium text-gray-900"
                            >
                              تعداد
                            </label>
                            <input
                              type="number"
                              name="count"
                              id="count"
                              value={product.count}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                              placeholder="تعداد را وارد ..."
                            />
                          </div>

                          <div className="text-right">
                            <label
                              htmlFor="unit"
                              className="block mb-1 text-sm font-medium text-gray-900"
                            >
                              واحد
                            </label>
                            <select
                              id="unit"
                              name="unit"
                              value={product.unit}
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
                              <option value="گده">گده</option>
                              <option value="دانه">دانه</option>
                              <option value="تیوب">تیوب</option>
                              <option value="رول">رول</option>
                              <option value="طفرا">طفرا</option>
                              <option value="باب">باب</option>
                              <option value="بسته">بسته</option>
                              <option value="عراده">عراده</option>
                              <option value="پایه">پایه</option>
                              <option value="لیتر">لیتر</option>
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

                          <div className="text-right">
                            <label
                              htmlFor="quantity"
                              className="block mb-1 text-sm font-medium text-gray-900"
                            >
                              قیمت فیات
                            </label>
                            <input
                              type="number"
                              name="priceperunit"
                              id="priceperunit"
                              value={product.priceperunit}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                              placeholder="قیمت فی واحد را وارد..."
                            />
                          </div>
                          <div className="text-right">
                            <label
                              htmlFor="quantity"
                              className="block mb-1 text-sm font-medium text-gray-900"
                            >
                              قیمت مجموعی
                            </label>
                            <input
                              type="number"
                              name="totleprice"
                              id="totleprice"
                              value={product.totleprice}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                              placeholder="قیمت مجموعی را وارد..."
                            />
                          </div>

                          <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md w-fit">
                            <label className="text-gray-800 font-semibold text-sm whitespace-nowrap">
                              انتخاب کتگوری:
                            </label>
                            <select
                              name="category"
                              value={product.category}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="border border-gray-300 bg-gray-50 text-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150"
                            >
                              <option value="">انتخاب کتگوری</option>
                              <option value="قرطاسیه">قرطاسیه</option>
                              <option value="روغنیات">روغنیات</option>
                              <option value="اجناس حفظ و مراقبت">
                                اجناس حفظ و مراقبت
                              </option>
                              <option value="اجناس دفتری">اجناس دفتری</option>
                              <option value=" تجهیزات آی تی">
                                {" "}
                                تجهیزات آی تی{" "}
                              </option>
                            </select>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    onClick={addProduct}
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                  >
                    اضافه کردن جنس
                  </button>
                  <button
                    type="button"
                    onClick={addProductModalSetting}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    ref={cancelButtonRef}
                  >
                    لغو کردن
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

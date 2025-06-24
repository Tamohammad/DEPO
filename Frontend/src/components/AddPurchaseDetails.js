import { Fragment, useRef, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function AddPurchaseDetails({
  addSaleModalSetting,
  products,
  handlePageUpdate,
  authContext,
}) {
  const [purchase, setPurchase] = useState({
    userID: authContext.user,
    productID: "",
    category: "",
    quantityPurchased: "",
    pricePerUnit: "",
    unit: "",
    purchaseDate: "",
    totalPurchaseAmount: "",
  });
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  // محاسبه خودکار مجموع مبلغ خرید
  useEffect(() => {
    const quantity = parseFloat(purchase.quantityPurchased);
    const price = parseFloat(purchase.pricePerUnit);
    if (!isNaN(quantity) && !isNaN(price)) {
      setPurchase((prev) => ({
        ...prev,
        totalPurchaseAmount: (quantity * price).toFixed(2),
      }));
    } else {
      setPurchase((prev) => ({
        ...prev,
        totalPurchaseAmount: "",
      }));
    }
  }, [purchase.quantityPurchased, purchase.pricePerUnit]);

  const handleInputChange = (key, value) => {
    setPurchase({ ...purchase, [key]: value });
  };

  const addSale = () => {
    fetch("http://localhost:4000/api/purchase/add", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(purchase),
    })
      .then(() => {
        alert("Purchase ADDED");
        handlePageUpdate();
        addSaleModalSetting();
      })
      .catch((err) => console.log(err));
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
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg py-4 font-semibold leading-6 text-gray-900 text-right"
                      >
                        فورم اعاده اقلام
                      </Dialog.Title>
                      <form>
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          {/* انتخاب جنس */}
                          <div>
                            <label
                              htmlFor="productID"
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                            >
                              نام جنس
                            </label>
                            <input
                              type="text"
                              id="productID"
                              name="productID"
                              value={purchase.productID}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                              placeholder="نام جنس را وارد کنید"
                            />
                          </div>
                          {/* تشرحات جنس */}
                          <div>
                            <label
                              htmlFor="productID"
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                            >
                              تشریحات جنس
                            </label>
                            <input
                              type="text"
                              id="productID"
                              name="productID"
                              value={purchase.productID}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                              placeholder="نام جنس را وارد کنید"
                            />
                          </div>
                          {/* تعداد خرید */}
                          <div>
                            <label
                              htmlFor="quantityPurchased"
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                            >
                              تعداد
                            </label>
                            <input
                              type="number"
                              name="quantityPurchased"
                              id="quantityPurchased"
                              value={purchase.quantityPurchased}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                              placeholder="تعداد جنس"
                            />
                          </div>

                          {/* واحد */}
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
                              value={purchase.unit}
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
                          {/* تاریخ اعاده*/}
                          <div>
                            <label
                              htmlFor="purchaseDate"
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                            >
                              تاریخ اعاده
                            </label>
                            <input
                              type="date"
                              id="purchaseDate"
                              name="purchaseDate"
                              value={purchase.purchaseDate}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                            />
                          </div>
                          {/* قیمت فی واحد */}
                          <div>
                            <label
                              htmlFor="pricePerUnit"
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                            >
                              قیمت گذاری فی واحد
                            </label>
                            <input
                              type="number"
                              name="pricePerUnit"
                              id="pricePerUnit"
                              value={purchase.pricePerUnit}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                              placeholder="قیمت فی واحد"
                            />
                          </div>

                          {/* مجموع قیمت گذاری*/}
                          <div>
                            <label
                              htmlFor="totalPurchaseAmount"
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                            >
                              مجموع قیمت گذاری
                            </label>
                            <input
                              type="number"
                              name="totalPurchaseAmount"
                              id="totalPurchaseAmount"
                              value={purchase.totalPurchaseAmount}
                              readOnly
                              className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                              placeholder="قیمت مجموعی"
                            />
                          </div>
                          {/* انتخاب کتگوری */}
                          <div>
                            <label
                              htmlFor="category"
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                            >
                              انتخاب کتگوری
                            </label>
                            <select
                              id="category"
                              name="category"
                              value={purchase}
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

                {/* دکمه‌ها */}
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={addSale}
                  >
                    اضافه کردن
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => addSaleModalSetting()}
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

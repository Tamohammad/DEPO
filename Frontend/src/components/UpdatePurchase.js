import { Fragment, useRef, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";

export default function UpdatePurchase({
  updateModalSetting,
  handlePageUpdate,
  purchaseData,
}) {
  const [purchase, setPurchase] = useState({
    userID: "",
    productID: "",
    category: "",
    quantityPurchased: "",
    unit: "",
    pricePerUnit: "",
    totalPurchaseAmount: "",
    purchaseDate: null,
    purchaseDateShamsi: "",
  });

  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (purchaseData) {
      const dateObject = purchaseData.purchaseDateShamsi
        ? new DateObject({
            date: purchaseData.purchaseDateShamsi,
            calendar: persian,
            locale: persian_fa,
            format: "YYYY/MM/DD",
          })
        : null;

      setPurchase({
        ...purchaseData,
        purchaseDate: dateObject,
        purchaseDateShamsi: purchaseData.purchaseDateShamsi,
      });
    }
  }, [purchaseData]);

  useEffect(() => {
    const quantity = parseFloat(purchase.quantityPurchased);
    const price = parseFloat(purchase.pricePerUnit);
    if (!isNaN(quantity) && !isNaN(price)) {
      setPurchase((prev) => ({
        ...prev,
        totalPurchaseAmount: parseFloat((quantity * price).toFixed(2)),
      }));
    } else {
      setPurchase((prev) => ({
        ...prev,
        totalPurchaseAmount: "",
      }));
    }
  }, [purchase.quantityPurchased, purchase.pricePerUnit]);

  const handleInputChange = (key, value) => {
    setPurchase((prev) => ({ ...prev, [key]: value }));
  };

  const updatePurchase = () => {
    if (!purchase._id) {
      alert("شناسه خرید موجود نیست.");
      return;
    }

    const formattedPurchase = {
      ...purchase,
      purchaseDate: purchase.purchaseDate?.format("YYYY/MM/DD") || "",
      purchaseDateShamsi: purchase.purchaseDate?.format("YYYY/MM/DD") || "",
    };

    fetch(`http://localhost:4000/api/purchase/update/${purchase._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedPurchase),
    })
      .then((res) => {
        if (!res.ok) throw new Error("خطا در بروزرسانی");
        return res.json();
      })
      .then(() => {
        alert("ویرایش با موفقیت انجام شد");
        handlePageUpdate();
        updateModalSetting(false);
        setOpen(false);
      })
      .catch((err) => {
        alert("خطا در بروزرسانی: " + err.message);
      });
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={(val) => {
          setOpen(val);
          if (!val) updateModalSetting(false);
        }}
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg overflow-y-scroll">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PencilSquareIcon
                        className="h-6 w-6 text-yellow-500"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg py-4 font-semibold leading-6 text-gray-900 text-right"
                      >
                        ویرایش اطلاعات اجناس اعاده شده
                      </Dialog.Title>
                      <form>
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          {/* فیلدهای فرم */}
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
                              value={purchase.category}
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
                              <option value="تجهیزات آی تی">
                                تجهیزات آی تی
                              </option>
                            </select>
                          </div>

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

                          <div>
                            <label
                              htmlFor="purchaseDate"
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                            >
                              تاریخ
                            </label>
                            <DatePicker
                              calendar={persian}
                              locale={persian_fa}
                              value={purchase.purchaseDate}
                              onChange={(date) => {
                                handleInputChange("purchaseDate", date);
                                handleInputChange(
                                  "purchaseDateShamsi",
                                  date?.format("YYYY/MM/DD") || ""
                                );
                              }}
                              format="YYYY/MM/DD"
                              inputClass="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                              placeholder="تاریخ را انتخاب کنید"
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 sm:ml-3 sm:w-auto"
                    onClick={updatePurchase}
                  >
                    ویرایش
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => {
                      setOpen(false);
                      updateModalSetting(false);
                    }}
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

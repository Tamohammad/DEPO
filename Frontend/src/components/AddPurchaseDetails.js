import { Fragment, useRef, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function AddPurchaseDetails({
  addSaleModalSetting,
  handlePageUpdate,
  authContext,
}) {
  const [purchase, setPurchase] = useState({
    userID: authContext.user?._id || "",
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

  // ✅ به‌روزرسانی خودکار قیمت مجموعی
  useEffect(() => {
    const quantity = parseFloat(purchase.quantityPurchased);
    const price = parseFloat(purchase.pricePerUnit);

    if (!isNaN(quantity) && !isNaN(price)) {
      const total = (quantity * price).toFixed(2);
      setPurchase((prev) => ({
        ...prev,
        totalPurchaseAmount: total,
      }));
    } else {
      setPurchase((prev) => ({
        ...prev,
        totalPurchaseAmount: "",
      }));
    }
  }, [purchase.quantityPurchased, purchase.pricePerUnit]);

  const handleInputChange = (eOrName, value) => {
    if (typeof eOrName === "string") {
      const name = eOrName;
      setPurchase((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "purchaseDate" && value
          ? { purchaseDateShamsi: value.format("YYYY/MM/DD") }
          : {}),
      }));
    } else {
      const { name, value } = eOrName.target;
      setPurchase((prev) => ({ ...prev, [name]: value }));
    }
  };

  const closeModal = () => {
    setOpen(false);
    addSaleModalSetting();
  };

  const addSale = async () => {
    const {
      productID,
      category,
      quantityPurchased,
      unit,
      pricePerUnit,
      purchaseDate,
      ProductDateShamsi,
    } = purchase;

    if (
      !productID ||
      !category ||
      !quantityPurchased ||
      !pricePerUnit ||
      !unit ||
      !purchaseDate
    ) {
      alert("لطفاً تمام فیلدهای لازم را پر کنید.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/purchase/add", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(purchase),
      });
      if (!response.ok) throw new Error("خطا در ارسال اطلاعات");

      alert("جنس اعاده شده با موفقیت اضافه شد✅.");
      handlePageUpdate();
      closeModal();
    } catch (err) {
      alert(err.message);
      console.error(err);
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
                        فورم اعاده جنس
                      </Dialog.Title>
                      <form>
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
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
                              onChange={handleInputChange}
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
                              onChange={handleInputChange}
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
                              onChange={handleInputChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                              placeholder="تعداد جنس"
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
                              value={purchase.unit}
                              onChange={handleInputChange}
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
                              <option value="توتل">بوتل</option>
                              <option value="سیت">سیت</option>
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor="pricePerUnit"
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                            >
                              قیمت گذاری فیات
                            </label>
                            <input
                              type="number"
                              name="pricePerUnit"
                              id="pricePerUnit"
                              value={purchase.pricePerUnit}
                              onChange={handleInputChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                              placeholder="قیمت فی واحد"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="totalPurchaseAmount"
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                            >
                              قیمت گذاری مجموعی
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

                          {/* تاریخ */}
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
                              onChange={(date) =>
                                handleInputChange("purchaseDate", date)
                              }
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

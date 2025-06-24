
import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function UpdateSales({ updateProductData, closeModal ,handlePageUpdate }) {
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
    saleDate,
    description,
  });

  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

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

 const updateSales = async () => {
  try {
    const response = await fetch(`http://localhost:4000/api/sales/update/${sale._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sale),
    });

    const result = await response.json();

    if (response.ok) {
      alert("فروش با موفقیت آپدیت شد");
      handlePageUpdate();
      setOpen(false);
      closeModal();
    } else {
      console.error("خطا از سمت سرور:", result);
      alert("خطا در هنگام آپدیت فروش: " + (result.message || JSON.stringify(result)));
    }
  } catch (error) {
    console.error("خطا:", error);
    alert("مشکلی در ارتباط با سرور رخ داده است.");
  }
};


  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
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
          <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-right shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg overflow-y-scroll">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateSales();
                  }}
                >
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 grid gap-4">
                    <h3 className="text-lg font-bold mb-2">ویرایش فروش</h3>

                    <label className="flex flex-col">
                      شماره توزیع:
                      <input
                        type="text"
                        value={sale.distributedNumber}
                        onChange={(e) => handleInputChange("distributedNumber", e.target.value)}
                        className="border p-2 rounded"
                      />
                    </label>

                    <label className="flex flex-col">
                      شناسه محصول:
                      <input
                        type="text"
                        value={sale.productID}
                        onChange={(e) => handleInputChange("productID", e.target.value)}
                        className="border p-2 rounded"
                      />
                    </label>

                    <label className="flex flex-col">
                      دسته‌بندی:
                      <input
                        type="text"
                        value={sale.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        className="border p-2 rounded"
                      />
                    </label>

                    <label className="flex flex-col">
                      تعداد فروخته شده:
                      <input
                        type="number"
                        value={sale.stockSold}
                        onChange={(e) => handleInputChange("stockSold", e.target.value)}
                        className="border p-2 rounded"
                      />
                    </label>

                    <label className="flex flex-col">
                      واحد:
                      <input
                        type="text"
                        value={sale.unit}
                        onChange={(e) => handleInputChange("unit", e.target.value)}
                        className="border p-2 rounded"
                      />
                    </label>

                    <label className="flex flex-col">
                      قیمت واحد (تومان):
                      <input
                        type="number"
                        value={sale.saleAmount}
                        onChange={(e) => handleInputChange("saleAmount", e.target.value)}
                        className="border p-2 rounded"
                      />
                    </label>

                    <label className="flex flex-col">
                      مبلغ کل (تومان):
                      <input
                        type="text"
                        value={sale.totalSaleAmount}
                        disabled
                        className="border p-2 rounded bg-gray-100"
                      />
                    </label>

                    <label className="flex flex-col">
                      دپارتمان:
                      <input
                        type="text"
                        value={sale.department}
                        onChange={(e) => handleInputChange("department", e.target.value)}
                        className="border p-2 rounded"
                      />
                    </label>

                    <label className="flex flex-col">
                      تاریخ فروش:
                      <input
                        type="date"
                        value={sale.saleDate}
                        onChange={(e) => handleInputChange("saleDate", e.target.value)}
                        className="border p-2 rounded"
                      />
                    </label>

                    <label className="flex flex-col">
                      توضیحات:
                      <textarea
                        value={sale.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="border p-2 rounded"
                      />
                    </label>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    >
                      ذخیره آپدیت
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={closeModal}
                      ref={cancelButtonRef}
                    >
                      لغو
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}





import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
// import Sales from "../pages/Sales";
export default function AddSale({
  addSaleModalSetting,
  products,
  stores,
  handlePageUpdate,
  authContext
}) {
  const [sale, setSale] = useState({
    userID: authContext.user,
    distributedNumber:"",
    category: "",
    productID: "",
    stockSold: "",
    unit: "",
    saleAmount: "",
    totalSaleAmount: "",
    department: "",
    saleDate: "",
    description:"",
    
  });
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);



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


  // Handling Input Change for input fields
  const handleInputChange = (key, value) => {
    setSale({ ...sale, [key]: value });
  };

  // POST Data
  const addSale = () => {
    fetch("http://localhost:4000/api/sales/add", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(sale),
    })
      .then((result) => {
        alert("Sale ADDED");
        handlePageUpdate();
        addSaleModalSetting();
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
  console.log("محصولات دریافتی:", products);
}, [products]);


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
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left ">
                      <Dialog.Title
                        as="h3"
                        className="text-lg  py-4 font-semibold leading-6 text-gray-900 "
                      >
                        افزودن
                      </Dialog.Title>
                      <form action="#">
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                        

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
                              <option value="electronics">الکترونیک</option>
                              <option value="stationery">لوازم تحریر</option>
                              <option value="food">مواد غذایی</option>
                              <option value="construction">ساختمانی</option>
                            </select>
                          </div>






                          <div>
                            <label
                              htmlFor="productID"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-right" >
                              نام جنس
                            </label>
                            <select
                              id="productID"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full "
                              name="productID"
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            >
                              <option value="">انتخاب جنس</option>
                              {products.map((element, index) => {
                                return (
                                  <option key={element._id} value={element._id}>
                                    {element.name}
                                  </option>
                                );
                              })}
                         

                            </select>
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
                              <option value="" >انتخاب واحد</option>
                              <option value="kg">کیلوگرام</option>
                              <option value="liter">لیتر</option>
                              <option value="piece">عدد</option>
                              <option value="meter">متر</option>
                              <option value="box">جعبه</option>
                              <option value="pack">بسته</option>
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
                              htmlFor="totalSaleAmount"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-right"
                            >
                             قیمت مجموعی 
                            </label>
                            <input
                              type="number"
                              name="totalSaleAmount"
                              id="price"
                              value={sale.totalSaleAmount}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500  text-right"
                              placeholder="قیمت مجموعی"
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
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"  >
                          
     <option value="">انتخاب کنید</option>

    <optgroup label="پوهنځی انجنیری صنایع کیمیاوی">
      <option value="technology_mawad_auzwi">تکنالوژی مواد عضوی</option>
      <option value="technology_mawad_ghair_auzwi">تکنالوژی مواد غیر عضوی</option>
      <option value="technology_mawad_ghazai">تکنالوژی مواد غذایی</option>
      <option value="technology_process">تکنالوژی پروسس فلزات</option>
    </optgroup>

    <optgroup label="پوهنځی ساختمانی">
      <option value="sunati_madani">ساختمان های صنعتی و مدنی</option>
      <option value="muhandasi">مهندسی</option>
      <option value="shahar_sazi">شهر سازی</option>
       <option value="mudiriat">مدیریت و انجنیری ساختمان</option>
        <option value="rasm_takhnic">رسم تخنیکی و هندسه ترسیمی</option>
  
    </optgroup>

    <optgroup label="پوهنځی الکترومیخانیک">
      <option value="auto_mikhanic">انجنیری اتومیخانیک</option>
      <option value="tamin_barq">تامین برق موسسات صنعتی، شهرها و دهات</option>
    </optgroup>

     <optgroup label="پوهنځی کمپیوترساینس">
      <option value="information_system">سیستم های معلوماتی </option>
      <option value="Computer_Engineering">انجنیری کمپیوتر</option>
      <option value="Network_Engineering ">انجنیری شبکه</option>
    </optgroup>
     <optgroup label="  پوهنځی جيولوجي ومعدن">
      <option value="geaulogy_akshaf"> انجنیری جیولوجی و اکشاف معادن</option>
      <option value="madin_naft_gaz"> انجنیری معادن نفت و گاز</option>
      <option value="astikhrag"> انجنیری استخراج معادن مواد مفید جامد به طریقه برهنه</option>
      <option value="astikhrag_zir_zamini"> انجنیری استخراج معادن مواد مفید جامد به طریقه زیرزمینی</option>
     <option value="hydorology">جیولوجی انجنیری وهایدروجیولوجی</option>
    </optgroup>

     <optgroup label="پوهنځی انجنیری آب و محیط زیست">
      <option value="engineering_sakhtumani">انجنیری ساختمان های آب</option>
      <option value="Ab_rasani">آبرسانی و انجنیری محیط زیست</option>
     
    </optgroup>

     <optgroup label="پوهنځی انجنیری ساختمانهای ترانسپورتی">
      <option value="transiport">  انجنیری ساختمان های ترانسپورتی</option>
      <option value="rah_ahan">انجنیری راه آهن</option>
      
    </optgroup>

     <optgroup label="پوهنځی انجنیری جیوماتیک">
      <option value="system_atlat">سیستم اطلاعات جغرافیایی و سنجش از دور</option>
      <option value="code_astar">دیپارتمنت کدستر </option>
      <option value="geaudizi"> دیپارتمنت جیودیزی </option>
       <option value="geaudizi_engineering"> دیپارتمنت جیودیزی انجنیری </option>
    </optgroup>

    <optgroup label=" دیپارتمنت های عمومی">
      <option value="physic">فزیک</option>
      <option value="math">ریاضی</option>
      <option value="chemia">کیمیا</option>
       <option value="saqafat"> ثقافت</option>
    </optgroup>
  </select>
   </div>


                          
                          <div className="h-fit w-fit">
                            {/* <Datepicker
                              onChange={handleChange}
                              show={show}
                              setShow={handleClose}
                            /> */}
                            <label
                              className="block mb-2 text-sm font-medium text-gray-900 text-right"
                              htmlFor="salesDate"
                            >
                              تاریخ
                            </label>
                             <input
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full"
                              type="date"
                              id="saleDate"
                              name="saleDate"
                              value={sale.saleDate}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            /> 
                          </div>
                            {/* توضیحات */}

                            

                            <div className="sm:col-span-2 text-right">
                            <label htmlFor="description" 
                            className="block mb-2 text-sm font-medium text-gray-900">
                              مشخصات جنس
                            </label>
                            <textarea
                              id="description"
                              name="description"
                              rows="6"
                              value={sale.description}
                              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                              className="block w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300"
                              placeholder="شرحی بنویسید..."
                              dir="rtl"
                            />
                          </div>

    
                        
                        </div>
                        <div className="flex items-center space-x-4">
                          {/* <button
                            type="submit"
                            className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                          >
                            Update product
                          </button> */}
                          {/* <button
                            type="button"
                            className="text-red-600 inline-flex items-center hover:text-white border border-red-600 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                          >
                            <svg
                              className="mr-1 -ml-1 w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                            Delete
                          </button> */}
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
                    افزودن توزیع
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => addSaleModalSetting()}
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

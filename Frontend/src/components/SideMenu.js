import React from "react";
import { Link } from "react-router-dom";

function SideMenu() {
  const localStorageData = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r shadow-md">
      

      {/* لینک‌ها */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 text-sm text-gray-700">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <DashboardIcon />
          داشبورد
        </Link>

        <Link
          to="/inventory"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <BoxIcon />
          مدیریت اجناس
        </Link>

        <Link
          to="/purchase-details"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <CartIcon />
          جزئیات خرید
        </Link>

        <Link
          to="/sales"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <BarChartIcon />
          گزارش فروشات
        </Link>

        <Link
          to="/manage-store"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <SettingsIcon />
          تنظیمات انبار
        </Link>
      </nav>

      {/* پروفایل کاربر */}
      <div className="border-t p-4 flex items-center gap-3 bg-gray-50">
        <img
          alt="Profile"
          src={localStorageData.imageUrl}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-medium text-sm">
            {localStorageData.firstName + " " + localStorageData.lastName}
          </p>
          <p className="text-xs text-gray-500">{localStorageData.email}</p>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;

/* آیکون‌های SVG */
function DashboardIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0v-4h4v4m-4 0H9m0 0H6a1 1 0 01-1-1V10z" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
      <path d="M3 7l9 4 9-4" />
      <path d="M12 11v10" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
      <circle cx="9" cy="19" r="2" />
      <circle cx="17" cy="19" r="2" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M4 20h16M6 16V8m6 8v-4m6 4V4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M12 4v2m0 12v2m8-8h-2m-12 0H4m15.36-6.36l-1.42 1.42M6.05 17.95l-1.42 1.42m0-12.02l1.42 1.42M17.95 17.95l1.42 1.42" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../AuthContext";

// کامپوننت آیتم منو
function MenuItem({ to, icon: Icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-[15px] font-bold text-gray-800 border-b border-gray-200"
    >
      <Icon />
      {children}
    </Link>
  );
}

function SideMenu() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="w-64 h-full bg-white border-r shadow-md flex items-center justify-center text-gray-500 text-sm">
        لطفاً وارد شوید
      </div>
    );
  }

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`;
  const imageUrl = user?.imageUrl || "/default-avatar.png";
  const email = user?.email || "";

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r shadow-md">
      {/* منو */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <MenuItem to="/" icon={DashboardIcon}>
          نظارت عمومی
        </MenuItem>
        <MenuItem to="/inventory" icon={BoxIcon}>
          مدیریت اجناس
        </MenuItem>
        <MenuItem to="/sales" icon={BarChartIcon}>
          توزیع اجناس
        </MenuItem>
        <MenuItem to="/purchase-details" icon={ReturnIcon}>
          اجناس اعاده
        </MenuItem>
        <MenuItem to="/reports" icon={ReportIcon}>
          گزارشات
        </MenuItem>
        <MenuItem to="/manage-store" icon={SettingsIcon}>
          تنظیمات
        </MenuItem>
      </nav>

      {/* اطلاعات کاربر */}
      <div className="border-t p-4 flex items-center gap-3 bg-gray-50">
        <img
          alt="Profile"
          src={imageUrl}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-medium text-sm">{fullName}</p>
          <p className="text-xs text-gray-500">{email}</p>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;

// آیکون‌ها

function DashboardIcon() {
  return (
    <svg
      className="w-5 h-5 text-indigo-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0v-4h4v4m-4 0H9m0 0H6a1 1 0 01-1-1V10z"
      />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg
      className="w-5 h-5 text-indigo-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7l9-4 9 4v10l-9 4-9-4V7z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 4 9-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v10" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg
      className="w-5 h-5 text-indigo-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 20h16M6 16V8m6 8v-4m6 4V4"
      />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg
      className="w-5 h-5 text-indigo-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10v6a2 2 0 002 2h12a2 2 0 002-2v-6M16 6l-4-4-4 4M12 2v14"
      />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg
      className="w-5 h-5 text-indigo-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-3-3v6m2 4H7a2 2 0 01-2-2V7a2 2 0 012-2h3l3 3h4a2 2 0 012 2v5a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="w-5 h-5 text-indigo-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v2m0 12v2m8-8h-2m-12 0H4m15.36-6.36l-1.42 1.42M6.05 17.95l-1.42 1.42m0-12.02l1.42 1.42M17.95 17.95l1.42 1.42"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

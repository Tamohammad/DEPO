
// pages/ForgotPassword.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // مرحله ۱: تایید شماره
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleVerifyPhone = async () => {
    try {
      const res = await axios.post("http://localhost:4000/api/users/verify-phone", { phone });
      setStep(2); // برو به مرحله وارد کردن رمز
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "خطا در بررسی شماره تماس");
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await axios.post("http://localhost:4000/api/users/reset-password", {
        phone,
        newPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000); // برگرد به لاگین
    } catch (err) {
      setMessage(err.response?.data?.message || "خطا در تنظیم رمز عبور");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4">بازیابی رمز عبور</h2>
        {step === 1 ? (
          <>
            <input
              type="text"
              placeholder="شماره تماس"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border rounded px-3 py-2 mb-4 w-full"
            />
            <button
              onClick={handleVerifyPhone}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            >
              تایید شماره
            </button>
          </>
        ) : (
          <>
            <input
              type="password"
              placeholder="رمز جدید"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border rounded px-3 py-2 mb-4 w-full"
            />
            <button
              onClick={handleResetPassword}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
            >
              تنظیم رمز جدید
            </button>
          </>
        )}
        {message && <p className="mt-4 text-sm text-red-500">{message}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;

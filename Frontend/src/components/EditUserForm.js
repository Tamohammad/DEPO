// src/components/EditUserForm.jsx

import React, { useState, useEffect } from "react";

const EditUserForm = ({ user, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="p-6 bg-white border rounded shadow mt-6 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">ویرایش کاربر</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          placeholder="نام"
        />
        <input
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          placeholder="نام خانوادگی"
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          placeholder="ایمیل"
        />
        <input
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          placeholder="شماره تماس"
        />

        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            ذخیره
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            لغو
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserForm;

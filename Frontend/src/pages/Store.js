// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import EditUserForm from "../components/EditUserForm"; // ← کامپوننت ویرایش را وارد کن

// function Store() {
//   const [users, setUsers] = useState([]);
//   const [editingUser, setEditingUser] = useState(null);
//   const navigate = useNavigate();

//   // گرفتن لیست کاربران
//   const fetchUsers = async () => {
//     try {
//       const res = await axios.get("http://localhost:4000/api/users");
//       setUsers(res.data);
//     } catch (err) {
//       console.error("خطا در دریافت کاربران:", err);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // حذف کاربر
// const handleDelete = async (userId) => {
//   const confirmDelete = window.confirm("آیا از حذف این کاربر مطمئن هستید؟");
//   if (!confirmDelete) return;

//   try {
//     const response = await axios.delete(`http://localhost:4000/api/users/${userId}`);
//     alert(response.data.message); // پیام موفقیت
//     setUsers(users.filter((user) => user._id !== userId));
//   } catch (error) {
//     console.error("خطا در حذف کاربر:", error);
//     alert("حذف با خطا مواجه شد");
//   }
// };


//   // باز کردن فرم ویرایش
//   const handleEdit = (user) => {
//     setEditingUser(user);
//   };

//   // ذخیره ویرایش
//   const handleUpdate = async (updatedUser) => {
//     try {
//       await axios.put(`http://localhost:4000/api/users/${updatedUser._id}`, updatedUser);
//       fetchUsers();
//       setEditingUser(null);
//     } catch (error) {
//       console.error("خطا در به‌روزرسانی کاربر:", error);
//     }
//   };

//   return (
//     <div className="col-span-12 lg:col-span-10 flex justify-center">
//       <div className="flex flex-col gap-5 w-11/12 border-2 p-4">
//         <div className="flex justify-between items-center">
//           <span className="font-bold text-xl">مدیریت ادمین</span>
//           <button
//             className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
//             onClick={() => navigate("/register")}
//           >
//             اضافه نمودن حساب
//           </button>

    
//     <button
//       className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 text-xs rounded"
//       // onClick={handleLogout}
//     >
//       خروج از سیستم
//     </button>
//         </div>

//         <div className="overflow-x-auto mt-4">
//           <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
//             <thead className="bg-gray-100 text-gray-700">
//               <tr>
//                 <th className="px-4 py-2 text-center">تصویر</th>
//                 <th className="px-4 py-2 text-center">نام</th>
//                 <th className="px-4 py-2 text-center">تخلص</th>
//                 <th className="px-4 py-2 text-center">ایمیل</th>
//                 <th className="px-4 py-2 text-center">شماره تماس</th>
//                 <th className="px-4 py-2 text-center">عملیات</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map((user) => (
//                 <tr key={user._id} className="border-t">
//                   <td className="py-3 px-4 flex items-center justify-end">
//                     <img
//                       src={user.imageUrl || "https://via.placeholder.com/40"}
//                       alt="User"
//                       className="w-12 h-12 object-cover rounded-full ml-2"
//                     />
//                   </td>
//                   <td className="px-4 py-2 text-center">{user.firstName}</td>
//                   <td className="px-4 py-2 text-center">{user.lastName}</td>
//                   <td className="px-4 py-2 text-center">{user.email}</td>
//                   <td className="px-4 py-2 text-center">{user.phoneNumber || "شماره ثبت نشده"}</td>
//                   <td className="py-3 px-4 text-right space-x-2 space-x-reverse">
//                     <button
//                       onClick={() => handleEdit(user)}
//                       className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
//                     >
//                       ویرایش
//                     </button>
//                     <button
//                       onClick={() => handleDelete(user._id)}
//                       className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
//                     >
//                       حذف
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* فرم ویرایش */}
//         {editingUser && (
//           <EditUserForm
//             user={editingUser}
//             onCancel={() => setEditingUser(null)}
//             onSave={handleUpdate}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// export default Store;
///////////////////////////////////////////
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../AuthContext";
import EditUserForm from "../components/EditUserForm";

function Store() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();
  const { signout } = useContext(AuthContext);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("خطا در دریافت کاربران:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm("آیا از حذف این کاربر مطمئن هستید؟")) return;
    try {
      const res = await axios.delete(`http://localhost:4000/api/users/${userId}`);
      alert(res.data.message);
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("خطا در حذف کاربر:", error);
      alert("حذف با خطا مواجه شد");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleUpdate = async (updatedUser) => {
    try {
      await axios.put(`http://localhost:4000/api/users/${updatedUser._id}`, updatedUser);
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error("خطا در به‌روزرسانی کاربر:", error);
    }
  };

  const handleLogout = () => {
    if (window.confirm("آیا می‌خواهید از حساب کاربری خارج شوید؟")) {
      signout(() => navigate("/login"));
    }
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12 border-2 p-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-xl">مدیریت ادمین</span>
          <div className="flex gap-2">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
              onClick={() => navigate("/register")}
            >
              اضافه نمودن حساب
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 text-xs rounded"
              onClick={handleLogout}
            >
              خروج از سیستم
            </button>
          </div>
        </div>

        {/* جدول کاربران */}
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-center">تصویر</th>
                <th className="px-4 py-2 text-center">نام</th>
                <th className="px-4 py-2 text-center">تخلص</th>
                <th className="px-4 py-2 text-center">ایمیل</th>
                <th className="px-4 py-2 text-center">شماره تماس</th>
                <th className="px-4 py-2 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="py-3 px-4 flex items-center justify-end">
                    <img
                      src={user.imageUrl || "https://via.placeholder.com/40"}
                      alt="User"
                      className="w-12 h-12 object-cover rounded-full ml-2"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">{user.firstName}</td>
                  <td className="px-4 py-2 text-center">{user.lastName}</td>
                  <td className="px-4 py-2 text-center">{user.email}</td>
                  <td className="px-4 py-2 text-center">{user.phoneNumber || "شماره ثبت نشده"}</td>
                  <td className="py-3 px-4 text-right space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleEdit(user)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingUser && (
          <EditUserForm
            user={editingUser}
            onCancel={() => setEditingUser(null)}
            onSave={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}

export default Store;


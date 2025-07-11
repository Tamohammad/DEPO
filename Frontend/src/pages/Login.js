import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loginUser = (e) => {
    e.preventDefault();

    if (form.email === "" || form.password === "") {
      return alert(".برای وراد شدن به حساب کاربری، جزئیات را وارد کنید");
    }

    fetch("http://localhost:4000/api/login", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Login failed");
        return res.json();
      })
      .then((data) => {
        alert("ورود موفقانه");
        authContext.signin(data, () => navigate("/"));
      })
      .catch((err) => {
        console.error(err);
        alert("معلومات نادرست است، لطفا دوباره کوشش نمایید");
      });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 h-screen items-center place-items-center">
      <div className="flex justify-center">
        <img src={require("../assets/signup.jpg")} alt="" />
      </div>
      <div className="w-full max-w-md space-y-8 p-10 rounded-lg">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src={require("../assets/Logo.jpeg")}
            alt="Your Company"
          />
          <h2 className="mt-6 text-center text-3xl font-bold">
            برای ورود شدن به سیستم ایمیل و پسورد خود را وارد کنید
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={loginUser}>
          <div className="-space-y-px rounded-md shadow-sm">
            <input
              name="email"
              type="email"
              placeholder="ایمیل آدرس"
              value={form.email}
              onChange={handleInputChange}
              required
              className="text-right rtl border p-2 w-full"
            />
            <input
              name="password"
              type="password"
              placeholder="پسورد"
              value={form.password}
              onChange={handleInputChange}
              required
              className="text-right rtl border p-2 w-full mt-2"
            />
          </div>

          {/* لینک فراموشی رمز عبور */}
          <div className="text-sm text-right">
            <Link
              to="/forgot-password"
              className="text-indigo-600 hover:text-indigo-500"
            >
              رمز عبور را فراموش کرده‌اید؟
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-500"
          >
            وارد شوید
          </button>

          <p className="text-center text-sm mt-2 text-gray-600">
            یا{" "}
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-500"
            >
              اگر حساب کاربری ندارید، ثبت‌نام کنید
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;

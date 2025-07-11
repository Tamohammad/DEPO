require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const { main } = require("./models/index");
const productRoute = require("./router/product");
const purchaseRoute = require("./router/purchase");
const salesRoute = require("./router/sales");
const inventoryRoutes = require("./router/inventory");
const userRoute = require("./router/user");
const reportsRoute = require("./router/reports");
// const inventoryRoute = require("./router/inventory");
// const inventoryRoute = require("./router/inventoryRoutes");

const cors = require("cors");
const User = require("./models/users");

const app = express();
const PORT = 4000;

main();
app.use(express.json());
app.use(cors());

// Products API
app.use("/api/product", productRoute);

// Purchase API
app.use("/api/purchase", purchaseRoute);

// Sales API
app.use("/api/sales", salesRoute);
//inventory API
app.use("/api/inventory", inventoryRoutes);
// users API
app.use("/api/", userRoute);
// reports
app.use("/api", reportsRoute);

// ------------- Signin --------------
let userAuthCheck;
app.post("/api/login", async (req, res) => {
  console.log(req.body);
  // res.send("hi");
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    console.log("USER: ", user);
    if (user) {
      res.send(user);
      userAuthCheck = user;
    } else {
      res.status(401).send("Invalid Credentials");
      userAuthCheck = null;
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// Getting User Details of login user
app.get("/api/login", (req, res) => {
  res.send(userAuthCheck);
});
// ------------------------------------

// Registration API
app.post("/api/register", (req, res) => {
  let registerUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    phoneNumber: req.body.phoneNumber,
    imageUrl: req.body.imageUrl,
  });

  registerUser
    .save()
    .then((result) => {
      res.status(200).send(result);
      alert("Signup Successfull");
    })
    .catch((err) => console.log("Signup: ", err));
  console.log("request: ", req.body);
});

app.get("/testget", async (req, res) => {
  const result = await Product.findOne({ _id: "6429979b2e5434138eda1564" });
  res.json(result);
});
//////////////////////////بخش بازیابی رمز//////////////////
// تأیید شماره تماس
app.post("/api/users/verify-phone", async (req, res) => {
  const { phone } = req.body;

  try {
    const user = await User.findOne({ phoneNumber: phone });
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }
    res.json({ message: "شماره تایید شد" });
  } catch (error) {
    console.error("خطا در بررسی شماره:", error);
    res.status(500).json({ message: "خطا در سرور" });
  }
});

// تنظیم رمز عبور جدید (بدون انکریپشن)
app.post("/api/users/reset-password", async (req, res) => {
  const { phone, newPassword } = req.body;

  try {
    const user = await User.findOne({ phoneNumber: phone });
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    // رمز عبور بدون رمزنگاری
    user.password = newPassword;
    await user.save();

    res.json({ message: "رمز عبور جدید با موفقیت تنظیم شد" });
  } catch (error) {
    console.error("خطا در تنظیم رمز:", error);
    res.status(500).json({ message: "خطا در سرور" });
  }
});
/////////////////////////////////
// Here we are listening to the server
app.listen(PORT, () => {
  console.log("I am live again");
});

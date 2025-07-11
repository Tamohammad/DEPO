// router/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/users"); // مدل یوزر

// دریافت لیست تمام کاربران
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // حذف پسورد
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "مشکل در دریافت لیست کاربران" });
  }
});
// حدف کاربر
// DELETE کاربر با شناسه مشخص
// حذف کاربر با شناسه
router.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: "کاربر یافت نشد" });
    }

    res.status(200).json({ message: "کاربر موفقانه حذف شد" });
  } catch (error) {
    console.error("خطا در حذف کاربر:", error);
    res.status(500).json({ error: "خطا در حذف کاربر" });
  }
});

// ادیت کاربر
// ویرایش کاربر با شناسه
router.put("/users/:id", async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, imageUrl } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, phoneNumber, imageUrl },
      { new: true } // برگرداندن مقدار جدید پس از بروزرسانی
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "کاربر یافت نشد" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("خطا در ویرایش کاربر:", err);
    res.status(500).json({ error: "خطا در ویرایش کاربر" });
  }
});

module.exports = router;

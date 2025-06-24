
<<<<<<< HEAD
=======
const mongoose = require("mongoose");

>>>>>>> cc37c6d ( i added sales page completly)
const ProductSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // مطمئن شو مدل کاربر با همین نام تعریف شده
      required: true,
    },
    ticketserialnumber: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      default: Date.now,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    count: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    priceperunit: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
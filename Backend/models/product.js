const mongoose = require("mongoose");

const EntrySchema = new mongoose.Schema(
  {
    count: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // اگر نمی‌خوای هر entry یک ID جدا داشته باشه
);

const ProductSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    ticketserialnumber: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    entries: {
      type: [EntrySchema],
      default: [],
    },
    count: {
      type: Number,
      required: true,
      default: 0,
    },
    totleprice: {
      type: Number,
      required: true,
      default: 0,
    },
    priceperunit: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

// ⛔ اگر از totleprice زیاد استفاده می‌کنی بهتره با virtuals مقدار دهی نشه

module.exports =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

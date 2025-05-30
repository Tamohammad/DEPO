const mongoose = require("mongoose");


// ✅ Fix: Prevent "OverwriteModelError"
const ProductSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    priceperunit: {
      type: Number,
      required: true,
    },
    totleprice: {
      type: Number,
      required: true,
    },
    check: {
       type: String,
        required: true,
      }
  },
  { timestamps: true }
);

// ✅ Fix: Only register model if it hasn't been registered
module.exports = mongoose.models.product || mongoose.model("product", ProductSchema);

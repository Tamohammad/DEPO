const mongoose = require("mongoose");

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
    price: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,  // ❗ You mistakenly had this as Number — it should be String
      required: true,
    },
    quantity: {
      type: Number,  // ❗ You had this as String — quantity should be a number
      required: true,
    }
  },
  { timestamps: true }
);

const Product = mongoose.model("product", ProductSchema);
module.exports = Product;

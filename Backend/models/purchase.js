const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
   productID: {
  type: String, 
  required: true,
},
    category: {
      type: String,
      required: true,
    },
    quantityPurchased: {
      type: Number,
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    purchaseDate: {
      type: String,
      required: true,
    },
    totalPurchaseAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Purchase = mongoose.model("purchase", PurchaseSchema);
module.exports = Purchase;

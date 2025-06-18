const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
     distributedNumber:{
      type:Number,
      required:true
    },
      category: {
       type: String,
        required: true,
      },
    productID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: false,
    },
     stockSold: {
      type: Number,
      required: true,
    },
    unit:{
      type:String,
      required:true
    },
    saleAmount:{
      type:Number,
      required:true,
    },
     totalSaleAmount: {
      type: Number,
      required: true,
    },
    department:{
      type:String,
      required:true,
    },
      saleDate: {
      type: Date,
      required: true,
    },
     description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Sales = mongoose.model("sales", SaleSchema);
module.exports = Sales;

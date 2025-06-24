
const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
<<<<<<< HEAD
    distributedNumber: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    productID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    stockSold: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    saleAmount: {
      type: Number,
      required: true,
    },
    totalSaleAmount: {
      type: Number,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    saleDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
=======
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
      ref: "Product",
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
>>>>>>> cc37c6d ( i added sales page completly)
  },
  { timestamps: true }
);

const Sales = mongoose.model("sales", SaleSchema);
module.exports = Sales;
const express = require("express");
const router = express.Router();

const Purchase = require("../models/purchase");
const Sale = require("../models/sales");
const Inventory = require("../models/Inventory");

router.post("/report", async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body;

    let groupFormat = "%Y-%m-%d";
    if (type === "monthly") groupFormat = "%Y-%m";
    else if (type === "yearly") groupFormat = "%Y";

    const matchDate = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      matchDate.start = start;
      matchDate.end = end;
    }

    const data = await Purchase.aggregate([
      ...(matchDate.start
        ? [
            {
              $match: {
                purchaseDate: { $gte: matchDate.start, $lte: matchDate.end },
              },
            },
          ]
        : []),
      {
        $project: {
          date: "$purchaseDate", // برای خرید
          purchases: "$quantityPurchased",
          sales: { $literal: 0 },
        },
      },
      {
        $unionWith: {
          coll: "sales",
          pipeline: [
            ...(matchDate.start
              ? [
                  {
                    $match: {
                      saleDate: { $gte: matchDate.start, $lte: matchDate.end },
                    },
                  },
                ]
              : []),
            {
              $project: {
                date: "$saleDate", // برای فروش
                purchases: { $literal: 0 },
                sales: "$quantitySold",
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: "$date",
            },
          },
          totalPurchases: { $sum: "$purchases" },
          totalSales: { $sum: "$sales" },
        },
      },
      {
        $project: {
          period: "$_id",
          purchases: "$totalPurchases",
          sales: "$totalSales",
          remaining: { $subtract: ["$totalPurchases", "$totalSales"] },
          _id: 0,
        },
      },
      { $sort: { period: 1 } },
    ]);

    res.json({ data });
  } catch (error) {
    console.error("❌ خطا در گزارش:", error);
    res.status(500).json({ message: "خطا در دریافت گزارش" });
  }
});

module.exports = router;

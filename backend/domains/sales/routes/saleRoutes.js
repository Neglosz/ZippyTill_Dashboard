const express = require("express");
const router = express.Router();
const saleController = require("../controllers/saleController");

router.get("/top-selling", saleController.getTopSellingProducts);
router.get("/products", saleController.getProducts);
router.get("/by-category", saleController.getSalesByCategory);
router.get("/summary", saleController.getSalesSummary);
router.get("/dashboard-metrics", saleController.getDashboardMetrics);
router.get("/weekly-analytics", saleController.getWeeklyAnalytics);
router.get("/finance-stats", saleController.getFinanceStats);
router.get("/daily-finance", saleController.getDailyFinance);
router.get("/monthly-finance", saleController.getMonthlyFinance);
router.get("/history", saleController.getSalesHistory);

module.exports = router;

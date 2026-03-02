const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const productController = require("../controllers/productController");
const orderController = require("../controllers/orderController");
const financeController = require("../controllers/financeController");
const creditController = require("../controllers/creditController");
const promotionController = require("../controllers/promotionController");
const saleController = require("../controllers/saleController");
const storeController = require("../controllers/storeController");
const transactionController = require("../controllers/transactionController");
const aiController = require("../controllers/aiController");

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const productValidation = require("../validations/productValidation");

// Auth Routes (Public)
router.post("/auth/login", authController.login);

// Protected Routes (Apply middleware to everything below)
router.use(authMiddleware);

router.post("/auth/logout", authController.logout);
router.get("/auth/user", authController.getCurrentUser);

// Product Routes
router.get("/products", validate(productValidation.branchQuery), productController.getAllProducts);
router.post("/products", validate(productValidation.createProduct), productController.createProduct);
router.put("/products/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);
router.get("/products/categories", validate(productValidation.branchQuery), productController.getAllCategories);
router.post("/products/categories", productController.createCategory);
router.get("/products/notifications", validate(productValidation.branchQuery), productController.getDashboardNotifications);
router.get("/products/movements", validate(productValidation.branchQuery), productController.getStockMovements);
router.post("/products/removal", productController.recordStockRemoval);

// Order Routes
router.post("/orders", orderController.createOrder);
router.get("/orders/recent", orderController.getRecentOrders);
router.get("/orders/:id", orderController.getOrderDetails);

// Finance Routes
router.get("/finance/transactions", financeController.getTransactions);
router.get("/finance/graph", financeController.getGraphData);

// Credit Routes
router.get("/credit/overdue", creditController.getOverdueItems);
router.put("/credit/debtor/:id", creditController.updateDebtor);
router.put("/credit/customer/:customerId", creditController.updateCustomerInfo);
router.get("/credit/recovery-rate", creditController.getRecoveryRate);

// Promotion Routes
router.get("/promotions", promotionController.getPromotions);
router.get("/promotions/:id", promotionController.getPromotionDetails);
router.post("/promotions", promotionController.createPromotion);

// Sale Routes
router.get("/sales/top-selling", saleController.getTopSellingProducts);
router.get("/sales/products", saleController.getProducts);
router.get("/sales/by-category", saleController.getSalesByCategory);
router.get("/sales/summary", saleController.getSalesSummary);
router.get("/sales/dashboard-metrics", saleController.getDashboardMetrics);
router.get("/sales/weekly-analytics", saleController.getWeeklyAnalytics);
router.get("/sales/finance-stats", saleController.getFinanceStats);
router.get("/sales/daily-finance", saleController.getDailyFinance);
router.get("/sales/monthly-finance", saleController.getMonthlyFinance);
router.get("/sales/history", saleController.getSalesHistory);

// Store Routes
router.get("/stores", storeController.getUserStores);
router.post("/stores/summary", storeController.getStoresSummary);
router.get("/stores/:id/stats", storeController.getStoreStats);
router.post("/stores/:id/access", storeController.updateLastAccessed);

// Transaction Routes
router.get("/transactions/aggregated", transactionController.getAggregatedTransactions);
router.get("/transactions/recent", transactionController.getRecentTransactions);
router.get("/transactions/finance-stats", transactionController.getFinanceStats);

// AI Routes
router.get("/ai/templates", aiController.getChatTemplates);
router.get("/ai/promotions", aiController.getPromotionRecommendations);
router.post("/ai/chat", aiController.chatWithAI);

module.exports = router;

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

// Import sub-routes from the same Core Domain
const authRoutes = require("./authRoutes");
const storeRoutes = require("./storeRoutes");
const settingRoutes = require("./settingRoutes");
const notificationRoutes = require("./notificationRoutes");
const profileRoutes = require("./profileRoutes");

// Import sub-routes from other Domains
const productRoutes = require("../../inventory/routes/productRoutes");

const orderRoutes = require("../../sales/routes/orderRoutes");
const financeRoutes = require("../../sales/routes/financeRoutes");
const creditRoutes = require("../../sales/routes/creditRoutes");
const saleRoutes = require("../../sales/routes/saleRoutes");
const transactionRoutes = require("../../sales/routes/transactionRoutes");

const promotionRoutes = require("../../promotions/routes/promotionRoutes");
const taxRoutes = require("../../taxes/routes/taxRoutes");
const aiRoutes = require("../../ai/routes/aiRoutes");

// Public routes
router.use("/auth", authRoutes);

// Protected routes middleware
router.use(authMiddleware);

// Feature routes
router.use("/profile", profileRoutes);
router.use("/products", productRoutes);
router.use("/transactions", transactionRoutes);
router.use("/orders", orderRoutes);
router.use("/finance", financeRoutes);
router.use("/credit", creditRoutes);
router.use("/promotions", promotionRoutes);
router.use("/sales", saleRoutes);

// --- Store & Notifications Priority Section ---
router.use("/", notificationRoutes);
router.use("/stores", settingRoutes);
router.use("/stores", storeRoutes);
// ----------------------------------------------

router.use("/ai", aiRoutes);
router.use("/tax", taxRoutes);

module.exports = router;

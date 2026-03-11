const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/aggregated", transactionController.getAggregatedTransactions);
router.get("/recent", transactionController.getRecentTransactions);
router.get("/finance-stats", transactionController.getFinanceStats);

module.exports = router;

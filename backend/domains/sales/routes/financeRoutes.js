const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");

// Finance/Transaction routes
router.get("/transactions", financeController.getTransactions);
router.get("/graph", financeController.getGraphData);

// Credit/Overdue routes (merged from creditRoutes)
router.get("/overdue", financeController.getOverdueItems);
router.get("/summary", financeController.getOverdueSummary);
router.put("/debtor/:id", financeController.updateDebtor);
router.put("/customer/:customerId", financeController.updateCustomerInfo);
router.get("/recovery-rate", financeController.getRecoveryRate);

module.exports = router;

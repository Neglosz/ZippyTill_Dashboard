const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");

router.get("/transactions", financeController.getTransactions);
router.get("/graph", financeController.getGraphData);

module.exports = router;

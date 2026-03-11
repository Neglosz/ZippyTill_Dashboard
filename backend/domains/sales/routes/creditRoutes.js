const express = require("express");
const router = express.Router();
const creditController = require("../controllers/creditController");

router.get("/overdue", creditController.getOverdueItems);
router.put("/debtor/:id", creditController.updateDebtor);
router.put("/customer/:customerId", creditController.updateCustomerInfo);
router.get("/recovery-rate", creditController.getRecoveryRate);

module.exports = router;

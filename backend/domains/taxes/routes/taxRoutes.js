const express = require("express");
const router = express.Router();
const taxController = require("../controllers/taxController");

router.get("/summary", taxController.getTaxSummary);
router.post("/calculate", taxController.calculate);

module.exports = router;


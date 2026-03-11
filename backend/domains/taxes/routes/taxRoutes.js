const express = require("express");
const router = express.Router();
const taxController = require("../controllers/taxController");

router.get("/summary", taxController.getTaxSummary);

module.exports = router;

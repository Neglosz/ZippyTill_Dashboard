const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.get("/sales", analyticsController.getSalesData);

module.exports = router;

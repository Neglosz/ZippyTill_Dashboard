const express = require("express");
const router = express.Router();
const settingController = require("../controllers/settingController");

router.get("/:storeId/settings", settingController.getSettings);
router.post("/:storeId/settings", settingController.updateSettings);

module.exports = router;

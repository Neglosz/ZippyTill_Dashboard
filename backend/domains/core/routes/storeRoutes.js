const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");

router.get("/", storeController.getUserStores);
router.get("/:id", storeController.getStoreById);
router.post("/summary", storeController.getStoresSummary);
router.get("/:id/stats", storeController.getStoreStats);
router.put("/:id", storeController.updateStore);
router.post("/:id/access", storeController.updateLastAccessed);

module.exports = router;

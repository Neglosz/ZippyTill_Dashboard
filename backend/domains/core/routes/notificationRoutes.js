const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Aligned with frontend notificationService.js
router.get("/stores/:storeId/notifications", notificationController.getNotifications);
router.put("/notifications/:id/read", notificationController.markAsRead);
router.put("/stores/:storeId/notifications/read-all", notificationController.markAllAsRead);

module.exports = router;

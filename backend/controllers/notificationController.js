const notificationService = require("../services/notificationService");

const notificationController = {
  async getNotifications(req, res) {
    try {
      const { storeId } = req.params;
      const notifications = await notificationService.getNotifications(storeId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const result = await notificationService.markAsRead(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async markAllAsRead(req, res) {
    try {
      const { storeId } = req.params;
      const result = await notificationService.markAllAsRead(storeId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = notificationController;

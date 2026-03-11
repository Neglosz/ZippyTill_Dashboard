const storeService = require("../services/storeService");

const storeController = {
  async getUserStores(req, res) {
    try {
      const userId = req.user.id;
      const data = await storeService.getUserStores(userId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getStoresSummary(req, res) {
    try {
      const { storeIds } = req.body;
      const data = await storeService.getStoresSummary(storeIds);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getStoreStats(req, res) {
    try {
      const { id } = req.params;
      const data = await storeService.getStoreStats(id);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateStore(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      const data = await storeService.updateStore(id, updateData, userId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateLastAccessed(req, res) {
    try {
      const { id } = req.params;
      await storeService.updateLastAccessed(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = storeController;

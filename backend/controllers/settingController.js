const settingService = require("../services/settingService");

const settingController = {
  async getSettings(req, res) {
    try {
      const { storeId } = req.params;
      const settings = await settingService.getSettings(storeId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateSettings(req, res) {
    try {
      const { storeId } = req.params;
      const settings = req.body;
      const result = await settingService.updateSettings(storeId, settings);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = settingController;

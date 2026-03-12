const analyticsService = require("../services/analyticsService");

const analyticsController = {
  async getSalesData(req, res) {
    try {
      const { storeId, groupBy } = req.query;
      const data = await analyticsService.getSalesData(storeId, groupBy);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = analyticsController;

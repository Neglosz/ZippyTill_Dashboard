const financeService = require("../services/financeService");

const financeController = {
  async getTransactions(req, res) {
    try {
      const { branchId, startDate, endDate } = req.query;
      const data = await financeService.getTransactions(branchId, startDate, endDate);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getGraphData(req, res) {
    try {
      const { branchId, viewType } = req.query;
      const data = await financeService.getGraphData(branchId, viewType);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = financeController;

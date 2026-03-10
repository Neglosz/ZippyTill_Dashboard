const transactionService = require("../services/transactionService");

const transactionController = {
  async getAggregatedTransactions(req, res) {
    try {
      const { storeId, periodType, date } = req.query;
      const data = await transactionService.getAggregatedTransactions(storeId, periodType, date);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getRecentTransactions(req, res) {
    try {
      const { storeId, limit, date } = req.query;
      const data = await transactionService.getRecentTransactions(storeId, limit, date);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getFinanceStats(req, res) {
    try {
      const { storeId, viewMode, date } = req.query;
      const data = await transactionService.getFinanceStats(storeId, viewMode, date);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = transactionController;

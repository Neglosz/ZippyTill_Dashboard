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

  // Merged creditController methods
  async getOverdueItems(req, res) {
    try {
      const { storeId } = req.query;
      const data = await financeService.getOverdueItems(storeId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateDebtor(req, res) {
    try {
      const { id } = req.params;
      const { debtorData, storeId } = req.body;
      const data = await financeService.updateDebtor(id, debtorData, storeId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateCustomerInfo(req, res) {
    try {
      const { customerId } = req.params;
      const { updateData, storeId } = req.body;
      const data = await financeService.updateCustomerInfo(customerId, updateData, storeId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getRecoveryRate(req, res) {
    try {
      const { storeId } = req.query;
      const data = await financeService.getRecoveryRate(storeId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getOverdueSummary(req, res) {
    try {
      const { storeId } = req.query;
      const data = await financeService.getOverdueSummary(storeId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = financeController;

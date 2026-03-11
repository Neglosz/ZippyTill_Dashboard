const saleService = require("../services/saleService");

const saleController = {
  async getTopSellingProducts(req, res) {
    try {
      const { branchId } = req.query;
      const data = await saleService.getTopSellingProducts(branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getProducts(req, res) {
    try {
      const { branchId } = req.query;
      const data = await saleService.getProducts(branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSalesByCategory(req, res) {
    try {
      const { branchId } = req.query;
      const data = await saleService.getSalesByCategory(branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSalesSummary(req, res) {
    try {
      const { branchId } = req.query;
      const data = await saleService.getSalesSummary(branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getDashboardMetrics(req, res) {
    try {
      const { branchId } = req.query;
      const data = await saleService.getDashboardMetrics(branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getWeeklyAnalytics(req, res) {
    try {
      const { branchId } = req.query;
      const data = await saleService.getWeeklyAnalytics(branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getFinanceStats(req, res) {
    try {
      const { branchId } = req.query;
      const data = await saleService.getFinanceStats(branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getDailyFinance(req, res) {
    try {
      const { branchId } = req.query;
      const data = await saleService.getDailyFinance(branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getMonthlyFinance(req, res) {
    try {
      const { branchId } = req.query;
      const data = await saleService.getMonthlyFinance(branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSalesHistory(req, res) {
    try {
      const { branchId, timeRange } = req.query;
      const data = await saleService.getSalesHistory(branchId, timeRange);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = saleController;

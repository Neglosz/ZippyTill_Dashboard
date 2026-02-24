const creditService = require("../services/creditService");

const creditController = {
  async getOverdueItems(req, res) {
    try {
      const { storeId } = req.query;
      const data = await creditService.getOverdueItems(storeId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateDebtor(req, res) {
    try {
      const { id } = req.params;
      const { debtorData, storeId } = req.body;
      const data = await creditService.updateDebtor(id, debtorData, storeId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateCustomerInfo(req, res) {
    try {
      const { customerId } = req.params;
      const { updateData, storeId } = req.body;
      const data = await creditService.updateCustomerInfo(customerId, updateData, storeId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getRecoveryRate(req, res) {
    try {
      const { storeId } = req.query;
      const data = await creditService.getRecoveryRate(storeId);
      res.json({ rate: data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = creditController;

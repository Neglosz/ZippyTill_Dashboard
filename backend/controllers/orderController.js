const orderService = require("../services/orderService");

const orderController = {
  async createOrder(req, res) {
    try {
      const { orderData, items, branchId } = req.body;
      const data = await orderService.createOrder(orderData, items, branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getRecentOrders(req, res) {
    try {
      const { storeId } = req.query;
      const data = await orderService.getRecentOrders(storeId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getOrderDetails(req, res) {
    try {
      const { id } = req.params;
      const { branchId } = req.query;
      const data = await orderService.getOrderDetails(id, branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = orderController;

const productService = require("../services/productService");

const productController = {
  async getAllProducts(req, res) {
    try {
      const { branchId } = req.query;
      const data = await productService.getAllProducts(branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createProduct(req, res) {
    try {
      const { productData, branchId } = req.body;
      const data = await productService.createProduct(productData, branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { productData, branchId } = req.body;
      const data = await productService.updateProduct(id, productData, branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const { branchId } = req.body;
      const success = await productService.deleteProduct(id, branchId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllCategories(req, res) {
    try {
      const { branchId } = req.query;
      const data = await productService.getAllCategories(branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getDashboardNotifications(req, res) {
    try {
      const { branchId } = req.query;
      const data = await productService.getDashboardNotifications(branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getStockMovements(req, res) {
    try {
      const { branchId } = req.query;
      const data = await productService.getStockMovements(branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async recordStockRemoval(req, res) {
    try {
      const { branchId, ...removalData } = req.body;
      const data = await productService.recordStockRemoval(removalData, branchId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = productController;

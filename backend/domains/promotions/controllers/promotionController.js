const promotionService = require("../services/promotionService");

const promotionController = {
  async getPromotions(req, res) {
    try {
      const { storeId } = req.query;
      const data = await promotionService.getPromotions(storeId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getPromotionDetails(req, res) {
    try {
      const { id } = req.params;
      const data = await promotionService.getPromotionDetails(id);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createPromotion(req, res) {
    try {
      const { promoData, products } = req.body;
      const data = await promotionService.createPromotion(promoData, products);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updatePromotion(req, res) {
    try {
      const { id } = req.params;
      const promoData = req.body;
      const data = await promotionService.updatePromotion(id, promoData);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deletePromotion(req, res) {
    try {
      const { id } = req.params;
      const authHeader = req.headers.authorization;
      await promotionService.deletePromotion(id, authHeader);
      res.json({ message: "Promotion deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deletePromotionItem(req, res) {
    try {
      const { id, productId } = req.params;
      await promotionService.deletePromotionItem(id, productId);
      res.json({ message: "Promotion item deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  previewPromotion: async (req, res) => {
    try {
      const { promoData, products } = req.body;
      const data = promotionService.previewPromotion(promoData, products);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};


module.exports = promotionController;

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
};

module.exports = promotionController;

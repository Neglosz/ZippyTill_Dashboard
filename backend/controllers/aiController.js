const aiService = require("../services/aiService");

const aiController = {
  getChatTemplates(req, res) {
    try {
      const templates = aiService.getChatTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getPromotionRecommendations(req, res) {
    try {
      const { branchId, branchName } = req.query;
      const data = await aiService.getPromotionRecommendations(
        branchId,
        branchName,
      );
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async chatWithAI(req, res) {
    try {
      const { message, history } = req.body;
      const response = await aiService.chatWithAI(message, history);
      res.json({ response });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async generatePromoName(req, res) {
    try {
      const { products, type, value } = req.body;
      const name = await aiService.generatePromoName({ products, type, value });
      res.json({ name });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async parsePromoPrompt(req, res) {
    try {
      const { prompt } = req.body;
      const data = await aiService.parsePromoPrompt({ prompt });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = aiController;

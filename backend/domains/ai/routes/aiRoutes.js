const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

router.get("/templates", aiController.getChatTemplates);
router.get("/promotions", aiController.getPromotionRecommendations);
router.post("/chat", aiController.chatWithAI);
router.post("/generate-promo-name", aiController.generatePromoName);
router.post("/parse-promo-prompt", aiController.parsePromoPrompt);

module.exports = router;

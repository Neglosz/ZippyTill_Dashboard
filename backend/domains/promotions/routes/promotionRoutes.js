const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");

router.get("/", promotionController.getPromotions);
router.get("/:id", promotionController.getPromotionDetails);
router.post("/", promotionController.createPromotion);
router.post("/preview", promotionController.previewPromotion);

router.put("/:id", promotionController.updatePromotion);
router.delete("/:id", promotionController.deletePromotion);
router.delete("/:id/items/:productId", promotionController.deletePromotionItem);

module.exports = router;

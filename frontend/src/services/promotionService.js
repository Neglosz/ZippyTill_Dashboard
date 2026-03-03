import { apiClient } from "./apiClient";

export const promotionService = {
  getPromotions: async (storeId) => {
    return apiClient.get(`/promotions?storeId=${storeId}`);
  },

  getPromotionDetails: async (promotionId) => {
    return apiClient.get(`/promotions/${promotionId}`);
  },

  createPromotion: async (promoData, products) => {
    return apiClient.post("/promotions", { promoData, products });
  },

  deletePromotion: async (promotionId) => {
    return apiClient.delete(`/promotions/${promotionId}`);
  },

  calculateEfficiency: (items, totalSales) => {
    return Math.floor(Math.random() * 40) + 60;
  },
};

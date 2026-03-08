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

  updatePromotion: async (promotionId, promoData) => {
    return apiClient.put(`/promotions/${promotionId}`, promoData);
  },

  deletePromotion: async (promotionId) => {
    return apiClient.delete(`/promotions/${promotionId}`);
  },

  deletePromotionItem: async (promotionId, productId) => {
    return apiClient.delete(`/promotions/${promotionId}/items/${productId}`);
  },

  calculateEfficiency: (items, totalSales) => {
    return Math.floor(Math.random() * 40) + 60;
  },
};

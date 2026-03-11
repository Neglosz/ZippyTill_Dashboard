import { apiClient } from "./apiClient";

export const aiService = {
  getChatTemplates: async () => {
    return apiClient.get("/ai/templates");
  },

  getPromotionRecommendations: async (branchId, branchName) => {
    return apiClient.get(
      `/ai/promotions?branchId=${branchId}&branchName=${encodeURIComponent(branchName)}`,
    );
  },

  chatWithAI: async (message, history = []) => {
    return apiClient.post("/ai/chat", { message, history });
  },

  generatePromoName: async ({ products, type, value }) => {
    return apiClient.post("/ai/generate-promo-name", { products, type, value });
  },

  parsePromoPrompt: async ({ prompt }) => {
    return apiClient.post("/ai/parse-promo-prompt", { prompt });
  },
};

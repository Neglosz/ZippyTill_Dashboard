import { apiClient } from "./apiClient";

export const aiService = {
  getChatTemplates: async () => {
    return apiClient.get("/ai/templates");
  },

  getPromotionRecommendations: async (branchId, branchName) => {
    return apiClient.get(`/ai/promotions?branchId=${branchId}&branchName=${encodeURIComponent(branchName)}`);
  },

  chatWithAI: async (message, history = []) => {
    return apiClient.post("/ai/chat", { message, history });
  },
};

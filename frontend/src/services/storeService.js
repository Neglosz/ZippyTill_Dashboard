import { apiClient } from "./apiClient";

export const storeService = {
  async getUserStores(userId) {
    return apiClient.get(`/stores?userId=${userId || ""}`);
  },

  async getStoresSummary(storeIds) {
    return apiClient.post("/stores/summary", { storeIds });
  },

  async getStoreStats(storeId) {
    return apiClient.get(`/stores/${storeId}/stats`);
  },

  async getStoreById(storeId) {
    return apiClient.get(`/stores/${storeId}`);
  },

  async updateLastAccessed(storeId) {
    return apiClient.post(`/stores/${storeId}/access`);
  },

  async updateStore(storeId, updateData) {
    return apiClient.put(`/stores/${storeId}`, updateData);
  },
};

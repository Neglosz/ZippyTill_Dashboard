import { apiClient } from "./apiClient";

export const settingService = {
  async getSettings(storeId) {
    return apiClient.get(`/stores/${storeId}/settings`);
  },

  async updateSettings(storeId, settings) {
    return apiClient.post(`/stores/${storeId}/settings`, settings);
  }
};

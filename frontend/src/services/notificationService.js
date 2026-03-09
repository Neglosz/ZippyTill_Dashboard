import { apiClient } from "./apiClient";

export const notificationService = {
  async getNotifications(storeId) {
    return apiClient.get(`/stores/${storeId}/notifications`);
  },

  async markAsRead(id) {
    return apiClient.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(storeId) {
    return apiClient.put(`/stores/${storeId}/notifications/read-all`);
  }
};

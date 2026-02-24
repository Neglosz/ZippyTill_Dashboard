import { apiClient } from "./apiClient";

export const orderService = {
  async createOrder(orderData, items, branchId) {
    return apiClient.post("/orders", { orderData, items, branchId });
  },

  async getRecentOrders(storeId) {
    return apiClient.get(`/orders/recent?storeId=${storeId}`);
  },

  async getOrderDetails(orderId, branchId) {
    return apiClient.get(`/orders/${orderId}?branchId=${branchId}`);
  },
};

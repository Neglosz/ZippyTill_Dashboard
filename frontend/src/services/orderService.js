import { apiClient } from "./apiClient";

export const orderService = {
  async createOrder(orderData, items, branchId) {
    return apiClient.post("/orders", { orderData, items, branchId });
  },

  async getRecentOrders(storeId, date) {
    const dateQuery = date ? `&date=${date}` : "";
    return apiClient.get(`/orders/recent?storeId=${storeId}${dateQuery}`);
  },

  async getOrderDetails(orderId, branchId) {
    return apiClient.get(`/orders/${orderId}?branchId=${branchId}`);
  },
};

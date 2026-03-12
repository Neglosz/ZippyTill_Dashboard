import { apiClient } from "./apiClient";

export const analyticsService = {
  async getSalesData(storeId, groupBy) {
    return apiClient.get(`/analytics/sales?storeId=${storeId}&groupBy=${groupBy}`);
  },
};

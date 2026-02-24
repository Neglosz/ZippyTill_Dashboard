import { apiClient } from "./apiClient";

export const financeService = {
  async getTransactions(branchId, startDate, endDate) {
    return apiClient.get(`/finance/transactions?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`);
  },

  async getGraphData(branchId, viewType) {
    return apiClient.get(`/finance/graph?branchId=${branchId}&viewType=${viewType}`);
  },
};

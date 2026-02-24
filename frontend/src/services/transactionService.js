import { apiClient } from "./apiClient";

export const transactionService = {
  getAggregatedTransactions: async (storeId, periodType, date) => {
    return apiClient.get(`/transactions/aggregated?storeId=${storeId}&periodType=${periodType}&date=${date}`);
  },

  getRecentTransactions: async (storeId, limit = 10) => {
    return apiClient.get(`/transactions/recent?storeId=${storeId}&limit=${limit}`);
  },

  getFinanceStats: async (storeId) => {
    return apiClient.get(`/transactions/finance-stats?storeId=${storeId}`);
  },
};

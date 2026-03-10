import { apiClient } from "./apiClient";

export const transactionService = {
  getAggregatedTransactions: async (storeId, periodType, date) => {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    return apiClient.get(`/transactions/aggregated?storeId=${storeId}&periodType=${periodType}&date=${dateStr}`);
  },

  getRecentTransactions: async (storeId, limit = 10) => {
    return apiClient.get(`/transactions/recent?storeId=${storeId}&limit=${limit}`);
  },

  getFinanceStats: async (storeId, viewMode, date) => {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    return apiClient.get(`/transactions/finance-stats?storeId=${storeId}&viewMode=${viewMode}&date=${dateStr}`);
  },
};

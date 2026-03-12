import { apiClient } from "./apiClient";

export const transactionService = {
  getAggregatedTransactions: async (storeId, periodType, date) => {
    const dateStr = date instanceof Date 
      ? date.toLocaleDateString('en-CA') // YYYY-MM-DD in local time
      : date;
    return apiClient.get(`/transactions/aggregated?storeId=${storeId}&periodType=${periodType}&date=${dateStr}`);
  },

  getRecentTransactions: async (storeId, limit = 10, date) => {
    const dateQuery = date ? `&date=${date}` : "";
    return apiClient.get(`/transactions/recent?storeId=${storeId}&limit=${limit}${dateQuery}`);
  },

  getFinanceStats: async (storeId, viewMode, date) => {
    const dateStr = date instanceof Date 
      ? date.toLocaleDateString('en-CA') // YYYY-MM-DD in local time
      : date;
    return apiClient.get(`/transactions/finance-stats?storeId=${storeId}&viewMode=${viewMode}&date=${dateStr}`);
  },
};

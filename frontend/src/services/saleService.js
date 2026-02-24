import { apiClient } from "./apiClient";

export const saleService = {
  getTopSellingProducts: async (branchId) => {
    return apiClient.get(`/sales/top-selling?branchId=${branchId}`);
  },

  getProducts: async (branchId) => {
    return apiClient.get(`/sales/products?branchId=${branchId}`);
  },

  getSalesByCategory: async (branchId) => {
    return apiClient.get(`/sales/by-category?branchId=${branchId}`);
  },

  getSalesSummary: async (branchId) => {
    return apiClient.get(`/sales/summary?branchId=${branchId}`);
  },

  getDashboardMetrics: async (branchId) => {
    return apiClient.get(`/sales/dashboard-metrics?branchId=${branchId}`);
  },

  getWeeklyAnalytics: async (branchId) => {
    return apiClient.get(`/sales/weekly-analytics?branchId=${branchId}`);
  },

  getFinanceStats: async (branchId) => {
    return apiClient.get(`/sales/finance-stats?branchId=${branchId}`);
  },

  getDailyFinance: async (branchId) => {
    return apiClient.get(`/sales/daily-finance?branchId=${branchId}`);
  },

  getMonthlyFinance: async (branchId) => {
    return apiClient.get(`/sales/monthly-finance?branchId=${branchId}`);
  },

  getSalesHistory: async (branchId, timeRange) => {
    return apiClient.get(`/sales/history?branchId=${branchId}&timeRange=${timeRange}`);
  },
};

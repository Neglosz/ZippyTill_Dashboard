import { apiClient } from "./apiClient";

export const taxService = {
  async getTaxSummary(branchId, year, period) {
    return apiClient.get(`/tax/summary?branchId=${branchId}&year=${year}&period=${period}`);
  },

  async calculateTax(data) {
    // data: { income, expenses, deductions, buyAmount, sellAmount }
    return apiClient.post(`/tax/calculate`, data);
  }
};

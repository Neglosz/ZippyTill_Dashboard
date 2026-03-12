import { apiClient } from "./apiClient";

export const financeService = {
  async getTransactions(branchId, startDate, endDate) {
    return apiClient.get(`/finance/transactions?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`);
  },

  async getGraphData(branchId, viewType) {
    return apiClient.get(`/finance/graph?branchId=${branchId}&viewType=${viewType}`);
  },

  async getOverdueItems(storeId) {
    return apiClient.get(`/finance/overdue?storeId=${storeId}`);
  },

  async getOverdueSummary(storeId) {
    return apiClient.get(`/finance/summary?storeId=${storeId}`);
  },

  async updateDebtor(id, debtorData, storeId) {
    return apiClient.put(`/finance/debtor/${id}`, { debtorData, storeId });
  },

  async updateCustomerInfo(customerId, updateData, storeId) {
    return apiClient.put(`/finance/customer/${customerId}`, { updateData, storeId });
  },

  async getRecoveryRate(storeId) {
    return apiClient.get(`/finance/recovery-rate?storeId=${storeId}`);
  },

  // Helper can stay on frontend if strictly for UI (legacy)
  // but we should prefer using values from backend
  calculateOverdueDays(dateString) {
    if (!dateString) return 0;
    const due = new Date(dateString);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const timeDiff = today.getTime() - due.getTime();
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
};

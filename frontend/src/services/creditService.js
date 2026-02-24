import { apiClient } from "./apiClient";

export const creditService = {
  async getOverdueItems(storeId) {
    return apiClient.get(`/credit/overdue?storeId=${storeId}`);
  },

  async updateDebtor(id, debtorData, storeId) {
    return apiClient.put(`/credit/debtor/${id}`, { debtorData, storeId });
  },

  async updateCustomerInfo(customerId, updateData, storeId) {
    return apiClient.put(`/credit/customer/${customerId}`, { updateData, storeId });
  },

  async getRecoveryRate(storeId) {
    const data = await apiClient.get(`/credit/recovery-rate?storeId=${storeId}`);
    return data.rate;
  },

  // Helper can stay on frontend if strictly for display
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

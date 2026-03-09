import { apiClient } from "./apiClient";

export const taxService = {
    async getTaxSummary(branchId, year, period) {
        return apiClient.get(`/tax/summary?branchId=${branchId}&year=${year}&period=${period}`);
    }
};

import { apiClient } from "./apiClient";

export const authService = {
  async login(email, password) {
    return apiClient.post("/auth/login", { email, password });
  },

  async logout() {
    const result = await apiClient.post("/auth/logout");
    sessionStorage.clear();
    return result;
  },

  async getCurrentUser() {
    return apiClient.get("/auth/user");
  },

  async getSession() {
    // Session management might still need some client-side logic depending on how you handle tokens,
    // but for now, we'll route it through the backend if applicable.
    return apiClient.get("/auth/user"); // Fallback to user for now
  },
};

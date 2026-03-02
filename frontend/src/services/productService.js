import { apiClient } from "./apiClient";

export const productService = {
  async getAllProducts(branchId) {
    return apiClient.get(`/products?branchId=${branchId}`);
  },

  async recordStockRemoval(removalData, branchId) {
    return apiClient.post(`/products/removal`, { ...removalData, branchId });
  },

  async getProductById(id, branchId) {
    // Backend controller expects query param or just ID, assuming ID is in path for now
    return apiClient.get(`/products/${id}?branchId=${branchId}`);
  },

  async createProduct(productData, branchId) {
    return apiClient.post("/products", { productData, branchId });
  },

  async updateProduct(id, productData, branchId) {
    return apiClient.put(`/products/${id}`, { productData, branchId });
  },

  async deleteProduct(id, branchId) {
    return apiClient.delete(`/products/${id}`, { branchId });
  },

  async getAllCategories(branchId) {
    return apiClient.get(`/products/categories?branchId=${branchId}`);
  },

  async createCategory(categoryName, branchId, categoryType) {
    return apiClient.post("/products/categories", {
      categoryName,
      branchId,
      categoryType,
    });
  },

  async getDashboardNotifications(branchId) {
    return apiClient.get(`/products/notifications?branchId=${branchId}`);
  },

  async getStockMovements(branchId) {
    return apiClient.get(`/products/movements?branchId=${branchId}`);
  },

  // Remaining product services if any (batches, removal, etc.)
};

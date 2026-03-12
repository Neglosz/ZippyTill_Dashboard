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

  _notificationCache: new Map(),
  async getDashboardNotifications(branchId) {
    if (this._notificationCache.has(branchId)) {
      return this._notificationCache.get(branchId);
    }
    const promise = apiClient.get(`/products/notifications?branchId=${branchId}`)
      .finally(() => {
        // Clean up cache after a short delay or after completion to allow shared access
        setTimeout(() => this._notificationCache.delete(branchId), 5000);
      });
    
    this._notificationCache.set(branchId, promise);
    return promise;
  },

  async getProductBatches(productId) {
    return apiClient.get(`/products/${productId}/batches`);
  },

  async getStockMovements(branchId) {
    return apiClient.get(`/products/movements?branchId=${branchId}`);
  },

  // Remaining product services if any (batches, removal, etc.)
};

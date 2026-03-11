import { apiClient } from "./apiClient";

export const profileService = {
  async getProfile() {
    return apiClient.get("/profile");
  },
  
  async updateProfile(profileData) {
    return apiClient.put("/profile", profileData);
  }
};

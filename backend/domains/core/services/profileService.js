const { supabase } = require("../config/supabase");

const profileService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("email, full_name, role, created_at")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId, profileData) {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: profileData.fullName,
        // email is usually handled by auth, not profiles table update directly if it's the primary email
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

module.exports = profileService;

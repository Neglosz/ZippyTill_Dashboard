import { supabase } from "../lib/supabase";

export const authService = {
  // Login
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    // Clear all session storage to reset UI states (like the dashboard notification)
    sessionStorage.clear();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  // Get session
  async getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },
};

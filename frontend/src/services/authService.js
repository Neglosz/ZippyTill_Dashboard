import { supabase } from "../lib/supabase";

export const authService = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn(
        "Supabase signout failed, clearing local session anyway:",
        error,
      );
    } finally {
      // Always clear storage to ensure the user is logged out locally
      localStorage.clear();
      sessionStorage.clear();
    }
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
};

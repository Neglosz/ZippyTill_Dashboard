const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Check your environment variables.");
}

// Enhance Supabase client with better retry logic and timeout for backend stability
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    // Add custom fetch with longer timeout and retry logic
    fetch: async (url, options) => {
      let retries = 3;
      let lastError;
      
      while (retries > 0) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.warn(`[Supabase Backend] Fetch timeout for ${url} after 60s`);
            controller.abort();
          }, 60000); // 60s timeout
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          lastError = error;
          retries--;
          if (retries > 0) {
            console.warn(`[Supabase Backend] Fetch failed for ${url}, retrying... (${retries} left): ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5s before retry
          }
        }
      }
      console.error(`[Supabase Backend] Fetch failed all retries for ${url}: ${lastError.message}`);
      throw lastError;
    }
  }
});

module.exports = { supabase };

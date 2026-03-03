import { supabase } from "../lib/supabase";

const API_URL = "http://127.0.0.1:5001/api";

const getHeaders = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {
      "Content-Type": "application/json",
    };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    return headers;
  } catch (error) {
    console.error("apiClient: Error getting auth session", error);
    return { "Content-Type": "application/json" };
  }
};

const fetchWithRetry = async (url, options, retries = 2) => {
  const timeout = 15000; // 15 seconds timeout
  
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(id);
    
    // Handle transient 401 (e.g., during token refresh)
    if (response.status === 401 && retries > 0) {
      console.warn("apiClient: 401 Unauthorized, retrying after delay...");
      await new Promise(resolve => setTimeout(resolve, 500));
      const newHeaders = await getHeaders();
      return fetchWithRetry(url, { ...options, headers: newHeaders }, retries - 1);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Something went wrong" }));
      throw new Error(error.message || error.error || "Something went wrong");
    }
    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error("Request timeout - The server is taking too long to respond");
    }
    
    // Retry on network errors like ERR_NETWORK_CHANGED or DNS/Fetch failures
    const isNetworkError = 
      error.name === "TypeError" || 
      error.message.toLowerCase().includes("fetch") || 
      error.message.toLowerCase().includes("network") ||
      error.message.toLowerCase().includes("failed");

    if (retries > 0 && isNetworkError) {
      console.warn(`apiClient: Network error (${error.message}), retrying... (${retries} left)`);
      // Wait longer between retries to allow network to stabilize
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Re-fetch headers to ensure token is still valid
      const freshHeaders = await getHeaders();
      return fetchWithRetry(url, { ...options, headers: freshHeaders }, retries - 1);
    }
    throw error;
  }
};

export const apiClient = {
  async get(endpoint) {
    const headers = await getHeaders();
    return fetchWithRetry(`${API_URL}${endpoint}`, {
      method: "GET",
      headers,
    });
  },

  async post(endpoint, body) {
    const headers = await getHeaders();
    return fetchWithRetry(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async put(endpoint, body) {
    const headers = await getHeaders();
    return fetchWithRetry(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async delete(endpoint, body) {
    const headers = await getHeaders();
    return fetchWithRetry(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  },
};

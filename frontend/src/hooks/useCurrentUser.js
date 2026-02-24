import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * Custom hook to fetch and manage the current authenticated user.
 * @returns {Object} { currentUser, loading }
 */
export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user for header:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return { currentUser, loading };
};

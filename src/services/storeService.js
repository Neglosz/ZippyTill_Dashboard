import { supabase } from "../lib/supabase";

export const storeService = {
  /**
   * Get all stores where the user is an owner or a member
   * @param {string} userId
   */
  async getUserStores(userId) {
    if (!userId) {
      // If no userId provided, attempt to get it from current session
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      userId = user.id;
    }

    // 1. Fetch stores owned by the user
    const { data: ownedStores, error: ownedError } = await supabase
      .from("stores")
      .select("*")
      .eq("owner_id", userId);

    if (ownedError) throw ownedError;

    // 2. Fetch stores where user is a member
    const { data: membershipData, error: memberError } = await supabase
      .from("store_members")
      .select(
        `
        store_id,
        role,
        stores (*)
      `,
      )
      .eq("user_id", userId);

    if (memberError) throw memberError;

    const memberStores = membershipData.map((m) => ({
      ...m.stores,
      role: m.role,
    }));

    // 3. Combine and remove duplicates (if any)
    const allStores = [...ownedStores.map((s) => ({ ...s, role: "owner" }))];

    memberStores.forEach((ms) => {
      if (!allStores.find((s) => s.id === ms.id)) {
        allStores.push(ms);
      }
    });

    return allStores;
  },

  /**
   * Get summary statistics for a collection of stores
   * This is a placeholder - actual implementation might need complex queries or edge functions
   */
  async getStoresSummary(storeIds) {
    if (!storeIds || storeIds.length === 0) return null;

    // For now returning mock aggregate data
    // In a real app, you might fetch today's sales and order count for these stores
    return {
      totalSales: 757010,
      totalOrders: 473,
      totalStaff: 37,
    };
  },
};

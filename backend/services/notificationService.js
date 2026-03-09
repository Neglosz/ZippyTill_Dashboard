const { supabase } = require("../config/supabase");

const notificationService = {
  async getNotifications(storeId, limit = 50) {
    if (!storeId) throw new Error("Store ID is required");

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async markAsRead(id) {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAllAsRead(storeId) {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("store_id", storeId)
      .eq("is_read", false)
      .select();

    if (error) throw error;
    return data;
  },

  async createNotification(storeId, type, message, meta = {}) {
    try {
      // Robust deduplication check for unread notifications
      // We check if an unread notification with the same type and productId/batchId exists
      let query = supabase
        .from('notifications')
        .select('id')
        .eq('store_id', storeId)
        .eq('type', type)
        .eq('is_read', false);

      if (meta.productId) {
        query = query.contains('payload', { productId: meta.productId });
      }
      
      if (meta.batchId) {
        query = query.contains('payload', { batchId: meta.batchId });
      }

      const { data: existing, error: checkError } = await query.limit(1).maybeSingle();
      
      if (checkError) {
        console.error("[Notification] Check duplicate error:", checkError.message);
      }

      if (existing) {
        // Already exists, don't create a new one
        return existing;
      }

      const { data, error } = await supabase
        .from("notifications")
        .insert({
          store_id: storeId,
          type,
          message,
          payload: meta
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("[Notification] Create error:", err.message);
      return null;
    }
  }
};

module.exports = notificationService;

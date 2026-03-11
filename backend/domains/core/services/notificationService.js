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
      const titleMap = {
        'low_stock': 'สินค้าใกล้หมด',
        'out_of_stock': 'สินค้าหมดสต็อก',
        'expired': 'สินค้าหมดอายุ',
        'expiring_soon': 'สินค้าใกล้หมดอายุ',
        'overdue': 'ยอดค้างชำระ',
        'order': 'ออเดอร์ใหม่',
        'system': 'ระบบ'
      };

      const title = meta.title || titleMap[type] || 'แจ้งเตือนระบบ';

      // 1. Check for unread duplicate
      let query = supabase
        .from('notifications')
        .select('id, created_at')
        .eq('store_id', storeId)
        .eq('type', type)
        .eq('is_read', false);

      if (meta.productId) {
        query = query.contains('payload', { productId: meta.productId });
      }
      
      const { data: existing } = await query.limit(1).maybeSingle();
      
      if (existing) {
        // If duplicate unread exists, update its timestamp to bring it to top
        const { data: updated } = await supabase
          .from('notifications')
          .update({ 
            created_at: new Date().toISOString(),
            message: message // Update message in case details changed (e.g. qty)
          })
          .eq('id', existing.id)
          .select()
          .single();
        return updated;
      }

      // 2. Insert new notification if no duplicate
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          store_id: storeId,
          type,
          title, // Added title field
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

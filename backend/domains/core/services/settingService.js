const { supabase } = require("../config/supabase");

const settingService = {
  async getSettings(storeId) {
    if (!storeId) throw new Error("Store ID is required");

    const { data, error } = await supabase
      .from("store_settings")
      .select("key, value")
      .eq("store_id", storeId);

    if (error) throw error;

    // Convert array to object
    return (data || []).reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  },

  async updateSetting(storeId, key, value) {
    if (!storeId) throw new Error("Store ID is required");
    if (!key) throw new Error("Key is required");

    const { data, error } = await supabase
      .from("store_settings")
      .upsert({ store_id: storeId, key, value }, { onConflict: "store_id, key" })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSettings(storeId, settings) {
    if (!storeId) throw new Error("Store ID is required");
    
    const upsertData = Object.entries(settings).map(([key, value]) => ({
      store_id: storeId,
      key,
      value
    }));

    const { data, error } = await supabase
      .from("store_settings")
      .upsert(upsertData, { onConflict: "store_id, key" })
      .select();

    if (error) throw error;
    return data;
  }
};

module.exports = settingService;

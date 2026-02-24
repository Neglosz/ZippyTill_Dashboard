const { supabase } = require("../config/supabase");

function calculateOverdueDays(dateString) {
  if (!dateString) return 0;
  const due = new Date(dateString);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const timeDiff = today.getTime() - due.getTime();
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return diffDays > 0 ? diffDays : 0;
}

const creditService = {
  async getOverdueItems(storeId) {
    if (!storeId) throw new Error("Store ID is required");
    const { data, error } = await supabase
      .from("credit_accounts")
      .select(`*, customers_info!inner (name, phone, image_url, store_id, due_date), orders (order_no, store_id)`)
      .eq("customers_info.store_id", storeId)
      .gt("remaining_amount", 0);
    if (error) throw error;
    return data.map((item) => ({
      id: item.id,
      customerId: item.customer_id,
      name: item.customers_info?.name || "Unknown",
      phone: item.customers_info?.phone || "-",
      imageUrl: item.customers_info?.image_url,
      amount: item.remaining_amount,
      totalAmount: item.total_debt,
      dueDate: item.due_date,
      customerDueDate: item.customers_info?.due_date,
      createdAt: item.created_at,
      status: item.status || "ค้างชำระ",
      overdueDays: calculateOverdueDays(item.due_date),
      orderId: item.order_id,
      orderNo: item.orders?.order_no || item.order_id,
    }));
  },

  async updateDebtor(id, debtorData, storeId) {
    if (!storeId) throw new Error("Store ID is required");
    const { data: accountData, error: fetchError } = await supabase
      .from("credit_accounts")
      .select("*, customers_info!inner(store_id)")
      .eq("id", id)
      .eq("customers_info.store_id", storeId)
      .single();
    if (fetchError) throw fetchError;

    if (debtorData.name || debtorData.phone) {
      const updateFields = {};
      if (debtorData.name) updateFields.name = debtorData.name;
      if (debtorData.phone) updateFields.phone = debtorData.phone;
      const { error: customerError } = await supabase
        .from("customers_info")
        .update(updateFields)
        .eq("id", accountData.customer_id)
        .eq("store_id", storeId);
      if (customerError) throw customerError;
    }

    const { data, error } = await supabase
      .from("credit_accounts")
      .update({ due_date: debtorData.dueDate, status: debtorData.status })
      .eq("id", id)
      .select(`*, customers_info (name, phone)`)
      .single();
    if (error) throw error;
    return {
      id: data.id,
      customerId: data.customer_id,
      name: data.customers_info?.name || "Unknown",
      phone: data.customers_info?.phone || "-",
      amount: data.remaining_amount,
      dueDate: data.due_date,
      status: data.status,
      overdueDays: calculateOverdueDays(data.due_date),
    };
  },

  async updateCustomerInfo(customerId, updateData, storeId) {
    if (!storeId) throw new Error("Store ID is required");
    const updateFields = {};
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
    if (updateData.customerDueDate !== undefined) updateFields.due_date = updateData.customerDueDate;
    const { data, error } = await supabase
      .from("customers_info")
      .update(updateFields)
      .eq("id", customerId)
      .eq("store_id", storeId)
      .select("id, name, phone, due_date, image_url")
      .single();
    if (error) throw error;
    return {
      customerId: data.id,
      name: data.name,
      phone: data.phone,
      customerDueDate: data.due_date,
      imageUrl: data.image_url,
    };
  },

  async deleteDebtor(id, storeId) {
    if (!storeId) throw new Error("Store ID is required");
    const { data, error: vError } = await supabase
      .from("credit_accounts")
      .select("*, customers_info!inner(store_id)")
      .eq("id", id)
      .eq("customers_info.store_id", storeId)
      .single();
    if (vError) throw vError;
    const { error } = await supabase.from("credit_accounts").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  async getRecoveryRate(storeId) {
    if (!storeId) return 0;
    const { data, error } = await supabase
      .from("credit_accounts")
      .select("total_debt, remaining_amount, customers_info!inner(store_id)")
      .eq("customers_info.store_id", storeId);
    if (error) throw error;
    if (!data || data.length === 0) return 100;
    const totalDebt = data.reduce((sum, item) => sum + Number(item.total_debt || 0), 0);
    const totalRemaining = data.reduce((sum, item) => sum + Number(item.remaining_amount || 0), 0);
    if (totalDebt === 0) return 100;
    const rate = Math.round(((totalDebt - totalRemaining) / totalDebt) * 100);
    return Math.max(0, Math.min(100, rate));
  },
};

module.exports = creditService;

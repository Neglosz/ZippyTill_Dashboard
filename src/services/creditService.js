import { supabase } from "../lib/supabase";

export const creditService = {
  // Get all sales that are on credit and not fully paid for a specific branch
  async getOverdueItems(storeId) {
    if (!storeId) throw new Error("Store ID is required");

    const { data, error } = await supabase
      .from("credit_accounts")
      .select(
        `
        *,
        customers_info!inner (
          name,
          phone,
          image_url,
          store_id,
          due_date
        ),
        orders (
          order_no,
          store_id
        )
      `,
      )
      .eq("customers_info.store_id", storeId) // Filter via joined customer record
      .gt("remaining_amount", 0); // Only items with debt remaining

    if (error) throw error;

    // Transform data to flat structure for UI
    return data.map((item) => ({
      id: item.id,
      customerId: item.customer_id, // Add customerId for grouping
      name: item.customers_info?.name || "Unknown",
      phone: item.customers_info?.phone || "-",
      imageUrl: item.customers_info?.image_url, // Map image_url
      amount: item.remaining_amount, // Show remaining debt
      totalAmount: item.total_debt, // Keep track of original total
      dueDate: item.due_date,
      customerDueDate: item.customers_info?.due_date, // Due date from customer info
      createdAt: item.created_at, // Add creation date
      status: item.status || "ค้างชำระ",
      overdueDays: calculateOverdueDays(item.due_date),
      orderNo: item.orders?.order_no || item.order_id, // Map order_no
    }));
  },

  // Update item (scoped to branch)
  async updateDebtor(id, debtorData, storeId) {
    if (!storeId) throw new Error("Store ID is required");

    // First, verify the account belongs to the store via customer join
    const { data: accountData, error: fetchError } = await supabase
      .from("credit_accounts")
      .select("*, customers_info!inner(store_id)")
      .eq("id", id)
      .eq("customers_info.store_id", storeId)
      .single();

    if (fetchError) throw fetchError;

    // Update customer info (name, phone)
    if (debtorData.name || debtorData.phone) {
      const updateFields = {};
      if (debtorData.name) updateFields.name = debtorData.name;
      if (debtorData.phone) updateFields.phone = debtorData.phone;

      const { error: customerError } = await supabase
        .from("customers_info")
        .update(updateFields)
        .eq("id", accountData.customer_id)
        .eq("store_id", storeId); // Scoped update

      if (customerError) throw customerError;
    }

    // Update credit_accounts (due_date, status)
    const { data, error } = await supabase
      .from("credit_accounts")
      .update({
        due_date: debtorData.dueDate,
        status: debtorData.status,
      })
      .eq("id", id)
      // Note: We can't filter update by join directly in Supabase,
      // but we verified it above and RLS should handle the rest.
      .select(
        `
        *,
        customers_info (
          name,
          phone
        )
      `,
      )
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

  // Update customer info (name, phone, due_date) directly on customers_info table
  async updateCustomerInfo(customerId, updateData, storeId) {
    if (!storeId) throw new Error("Store ID is required");

    const updateFields = {};
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
    if (updateData.customerDueDate !== undefined)
      updateFields.due_date = updateData.customerDueDate;

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

  // Delete item (scoped to branch)
  async deleteDebtor(id, storeId) {
    if (!storeId) throw new Error("Store ID is required");

    // First verify
    const { data, error: vError } = await supabase
      .from("credit_accounts")
      .select("*, customers_info!inner(store_id)")
      .eq("id", id)
      .eq("customers_info.store_id", storeId)
      .single();

    if (vError) throw vError;

    const { error } = await supabase
      .from("credit_accounts")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },

  // Get recovery rate for a specific branch
  async getRecoveryRate(storeId) {
    if (!storeId) return 0;

    const { data, error } = await supabase
      .from("credit_accounts")
      .select("total_debt, remaining_amount, customers_info!inner(store_id)")
      .eq("customers_info.store_id", storeId);

    if (error) throw error;
    if (!data || data.length === 0) return 100;

    const totalDebt = data.reduce(
      (sum, item) => sum + Number(item.total_debt || 0),
      0,
    );
    const totalRemaining = data.reduce(
      (sum, item) => sum + Number(item.remaining_amount || 0),
      0,
    );

    if (totalDebt === 0) return 100;

    const rate = Math.round(((totalDebt - totalRemaining) / totalDebt) * 100);
    return Math.max(0, Math.min(100, rate));
  },
};

// Helper function
function calculateOverdueDays(dateString) {
  if (!dateString) return 0;
  const due = new Date(dateString);
  const today = new Date();

  // Set time to midnight for accurate day calculation
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const timeDiff = today.getTime() - due.getTime();
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return diffDays > 0 ? diffDays : 0;
}

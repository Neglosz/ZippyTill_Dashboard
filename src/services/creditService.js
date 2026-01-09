import { supabase } from "../lib/supabase";

export const creditService = {
  // Get all sales that are on credit and not fully paid
  async getOverdueItems() {
    const { data, error } = await supabase
      .from("credit_accounts")
      .select(
        `
        *,
        customers_info (
          name,
          phone
        )
      `
      )
      .gt("remaining_amount", 0); // Only items with debt remaining

    if (error) throw error;

    // Transform data to flat structure for UI
    return data.map((item) => ({
      id: item.id,
      name: item.customers_info?.name || "Unknown",
      phone: item.customers_info?.phone || "-",
      amount: item.remaining_amount, // Show remaining debt
      totalAmount: item.total_debt, // Keep track of original total
      dueDate: item.due_date,
      createdAt: item.created_at, // Add creation date
      status: item.status || "ค้างชำระ",
      overdueDays: calculateOverdueDays(item.due_date),
    }));
  },

  // Update item (Simulate update for now, maybe just editing notes or extending due date)
  // In real world, we might update 'credit_accounts' or 'customers' table depending on what changed
  async updateDebtor(id, debtorData) {
    // First, get the customer_id from credit_accounts
    const { data: accountData, error: fetchError } = await supabase
      .from("credit_accounts")
      .select("customer_id")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Update customer info (name, phone) in customers_info table
    if (debtorData.name || debtorData.phone) {
      const updateFields = {};
      if (debtorData.name) updateFields.name = debtorData.name;
      if (debtorData.phone) updateFields.phone = debtorData.phone;

      const { error: customerError } = await supabase
        .from("customers_info")
        .update(updateFields)
        .eq("id", accountData.customer_id);

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
      .select(
        `
        *,
        customers_info (
          name,
          phone
        )
      `
      )
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.customers_info?.name || "Unknown",
      phone: data.customers_info?.phone || "-",
      amount: data.remaining_amount,
      dueDate: data.due_date,
      status: data.status,
      overdueDays: calculateOverdueDays(data.due_date),
    };
  },

  // Delete item (Voiding a credit sale?)
  async deleteDebtor(id) {
    const { error } = await supabase
      .from("credit_accounts")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
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

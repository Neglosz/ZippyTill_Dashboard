const { supabase } = require("../../core/config/supabase");

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

const financeService = {
  // Existing financeService methods
  async getTransactions(branchId, startDate, endDate) {
    if (!branchId) throw new Error("Branch ID is required");
    const { data, error } = await supabase
      .from("account_transactions")
      .select("*")
      .eq("store_id", branchId)
      .gte("trans_date", startDate)
      .lte("trans_date", endDate)
      .order("trans_date", { ascending: true });
    if (error) throw error;
    return data;
  },

  async getGraphData(branchId, viewType) {
    if (!branchId) throw new Error("Branch ID is required");
    const now = new Date();
    let startDate, endDate;
    const getLocalDate = (date) => {
      const offset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date - offset).toISOString().slice(0, -1);
      return localISOTime.split("T")[0];
    };
    if (viewType === "day") {
      const today = getLocalDate(now);
      startDate = today; endDate = today;
    } else if (viewType === "month") {
      const y = now.getFullYear(); const m = now.getMonth();
      const firstDay = new Date(y, m, 1); const lastDay = new Date(y, m + 1, 0);
      startDate = getLocalDate(firstDay); endDate = getLocalDate(lastDay);
    } else if (viewType === "year") {
      const y = now.getFullYear();
      startDate = `${y}-01-01`; endDate = `${y}-12-31`;
    }
    const { data: transactions, error } = await supabase
      .from("account_transactions")
      .select("*")
      .eq("store_id", branchId)
      .gte("trans_date", startDate)
      .lte("trans_date", endDate);
    if (error) throw error;

    let processedData = [];
    if (viewType === "day") {
      const hourly = Array.from({ length: 24 }, (_, i) => ({ name: i.toString().padStart(2, "0") + ":00", income: 0, expense: 0 }));
      transactions.forEach((t) => {
        const date = new Date(t.created_at); const hour = date.getHours();
        if (hour >= 0 && hour < 24) {
          if (t.trans_type === "income") hourly[hour].income += Number(t.amount);
          if (t.trans_type === "expense") hourly[hour].expense += Number(t.amount);
        }
      });
      processedData = hourly;
    } else if (viewType === "month") {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daily = Array.from({ length: daysInMonth }, (_, i) => ({ name: (i + 1).toString(), income: 0, expense: 0 }));
      transactions.forEach((t) => {
        const day = new Date(t.trans_date).getDate();
        if (day >= 1 && day <= daysInMonth) {
          if (t.trans_type === "income") daily[day - 1].income += Number(t.amount);
          if (t.trans_type === "expense") daily[day - 1].expense += Number(t.amount);
        }
      });
      processedData = daily;
    } else if (viewType === "year") {
      const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      const monthly = months.map((m) => ({ name: m, income: 0, expense: 0 }));
      transactions.forEach((t) => {
        const month = new Date(t.trans_date).getMonth();
        if (month >= 0 && month < 12) {
          if (t.trans_type === "income") monthly[month].income += Number(t.amount);
          if (t.trans_type === "expense") monthly[month].expense += Number(t.amount);
        }
      });
      processedData = monthly;
    }
    return processedData;
  },

  // Merged creditService methods
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
    if (!storeId) return { rate: 0, totalPaid: 0, totalDebt: 0 };

    const { data: accounts, error: accError } = await supabase
      .from("credit_accounts")
      .select("total_debt, remaining_amount, customers_info!inner(store_id)")
      .eq("customers_info.store_id", storeId);
    if (accError) throw accError;

    const currentTotalRemaining = (accounts || []).reduce((sum, item) => sum + Number(item.remaining_amount || 0), 0);

    const { data: txns, error: txnError } = await supabase
      .from("account_transactions")
      .select("amount")
      .eq("store_id", storeId)
      .eq("category", "debt_payment")
      .eq("trans_type", "income");
    if (txnError) throw txnError;

    const totalPaid = (txns || []).reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const totalDebt = currentTotalRemaining + totalPaid;

    if (totalDebt === 0) return { rate: 100, totalPaid: 0, totalDebt: 0 };
    const rate = Math.round((totalPaid / totalDebt) * 1000) / 10;

    return {
      rate: Math.max(0, Math.min(100, rate)),
      totalPaid,
      totalDebt
    };
  },

  // New method for aggregated summary
  async getOverdueSummary(storeId) {
    if (!storeId) throw new Error("Store ID is required");

    const overdueItems = await this.getOverdueItems(storeId);
    const recoveryData = await this.getRecoveryRate(storeId);

    const totalOverdueAmount = overdueItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const maxOverdueDays = overdueItems.reduce((max, item) => Math.max(max, item.overdueDays || 0), 0);
    const uniqueOverdueCustomers = new Set(overdueItems.map(i => i.customerId)).size;

    return {
      totalOverdueAmount,
      overdueRate: recoveryData.rate,
      maxOverdueDays,
      uniqueOverdueCustomers,
      totalPaid: recoveryData.totalPaid,
      totalDebt: recoveryData.totalDebt,
    };
  }
};

module.exports = financeService;

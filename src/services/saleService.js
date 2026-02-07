import { supabase } from "../lib/supabase";

export const saleService = {
  // Get top selling products with real sales data from order_items
  getTopSellingProducts: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    try {
      console.log(`Fetching top selling products for store_id: ${branchId}`);

      // Fetch from 'products' (using the pluralized/standard table name)
      const { data: products, error: prodError } = await supabase
        .from("products")
        .select(
          `
                    *,
                    product_categories (name),
                    order_items (qty, subtotal)
                `,
        )
        .eq("store_id", branchId);

      if (prodError) throw prodError;

      if (!products || products.length === 0) return [];

      // Process data to calculate totals
      const processedProducts = products.map((p) => {
        const totalSold = (p.order_items || []).reduce(
          (sum, item) => sum + (item.qty || 0),
          0,
        );
        const totalRevenue = (p.order_items || []).reduce(
          (sum, item) => sum + (item.subtotal || 0),
          0,
        );
        return {
          ...p,
          sold_qty: totalSold,
          revenue: totalRevenue,
        };
      });

      // Sort by sold quantity and take top 5
      return processedProducts
        .sort((a, b) => b.sold_qty - a.sold_qty)
        .slice(0, 5);
    } catch (error) {
      console.error("saleService getTopSellingProducts error:", error);
      throw error;
    }
  },

  getProducts: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`*, product_categories (name)`)
        .eq("store_id", branchId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("saleService getProducts error:", error);
      throw error;
    }
  },

  getSalesByCategory: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    try {
      const { data: products, error: prodError } = await supabase
        .from("products")
        .select(
          `
                    id,
                    product_categories (id, name),
                    order_items (qty, subtotal)
                `,
        )
        .eq("store_id", branchId);

      if (prodError) throw prodError;

      const categoryMap = {};

      products.forEach((p) => {
        const cat = p.product_categories;
        const catName = cat ? cat.name : "อื่นๆ";
        const totalRevenue = (p.order_items || []).reduce(
          (sum, item) => sum + (item.subtotal || 0),
          0,
        );

        if (!categoryMap[catName]) {
          categoryMap[catName] = { name: catName, revenue: 0 };
        }
        categoryMap[catName].revenue += totalRevenue;
      });

      return Object.values(categoryMap);
    } catch (error) {
      console.error("saleService getSalesByCategory error:", error);
      throw error;
    }
  },

  getSalesSummary: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    try {
      // 1. Get total stock count for this branch
      const { data: products, error: prodError } = await supabase
        .from("products")
        .select("stock_qty")
        .eq("store_id", branchId);

      if (prodError) throw prodError;

      const totalStock = (products || []).reduce(
        (sum, p) => sum + (p.stock_qty || 0),
        0,
      );

      // 2. Get Total Product Sold (sum of qty in order_items) - Filtered by branch via orders/order_items association
      // Note: In a real app, order_items belongs to an order which belongs to a branch.
      // Let's assume order_items table has branch_id if not we join orders.
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select(
          `
                    qty,
                    orders!inner(store_id)
                `,
        )
        .eq("orders.store_id", branchId);

      if (itemsError) throw itemsError;

      const totalSold = (items || []).reduce(
        (sum, item) => sum + (item.qty || 0),
        0,
      );

      return {
        totalProducts: totalStock || 0,
        totalSold: totalSold,
      };
    } catch (error) {
      console.error("saleService getSalesSummary error:", error);
      throw error;
    }
  },
};

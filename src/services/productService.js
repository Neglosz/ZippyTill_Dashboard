import { supabase } from "../lib/supabase";

export const productService = {
  // Get all products with category info for a specific branch
  async getAllProducts(branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_categories (
          name
        ),
        product_batches (
          expire_date
        )
      `,
      )
      .eq("store_id", branchId)
      .order("name");

    if (error) throw error;
    return data;
  },

  // Get single product (still scoped to branch for safety)
  async getProductById(id, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("store_id", branchId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new product with branchId
  async createProduct(productData, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          barcode: productData.barcode,
          name: productData.name,
          category_id: productData.categoryId,
          price: productData.price,
          cost_price: productData.costPrice,
          stock_qty: productData.stockQty || 0,
          unit_type: productData.unitType || "ชิ้น",
          store_id: branchId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get top stock products (High Stock)
  async getTopStockProducts(branchId, limit = 5) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data, error } = await supabase
      .from("products")
      .select("*, product_categories(name)")
      .eq("store_id", branchId)
      .order("stock_qty", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Update product (scoped to branch)
  async updateProduct(id, productData, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .eq("store_id", branchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete product (scoped to branch)
  async deleteProduct(id, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("store_id", branchId);

    if (error) throw error;
    return true;
  },

  // Get all categories for a specific branch
  async getAllCategories(branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data, error } = await supabase
      .from("product_categories")
      .select("*")
      .eq("store_id", branchId)
      .order("name");

    if (error) throw error;
    return data;
  },

  // Get batches for a product (scoped via product_id which is checked via RLS or subquery if needed, but here simple filter)
  async getProductBatches(productId) {
    // Note: Implicitly isolated if the user only has access to this product
    const { data, error } = await supabase
      .from("product_batches")
      .select("*")
      .eq("product_id", productId)
      .order("expire_date", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get dashboard notifications (Expired, Expiring Soon, Low Stock) - Scoped to Branch
  async getDashboardNotifications(branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const today = new Date().toISOString().split("T")[0];
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysStr = sevenDaysFromNow.toISOString().split("T")[0];

    // 1. Expired Products
    const { data: expiredData, error: expiredError } = await supabase
      .from("product_batches")
      .select("*, products(name, store_id, image_url)")
      .lt("expire_date", today)
      .gt("remaining_qty", 0)
      .returns();

    if (expiredError) throw expiredError;

    // Filter by branch locally for the join if needed, but ideally the query should handle it
    const filteredExpired = expiredData.filter(
      (b) => b.products?.store_id === branchId,
    );

    // 2. Expiring Soon (within 7 days)
    const { data: soonData, error: soonError } = await supabase
      .from("product_batches")
      .select("*, products(name, store_id, image_url)")
      .gte("expire_date", today)
      .lte("expire_date", sevenDaysStr)
      .gt("remaining_qty", 0);

    if (soonError) throw soonError;

    const filteredSoon = soonData.filter(
      (b) => b.products?.store_id === branchId,
    );

    // 3. Low Stock
    const { data: productsWithThreshold, error: thresholdError } =
      await supabase.from("products").select("*").eq("store_id", branchId);

    if (thresholdError) throw thresholdError;

    const filteredLowStock = productsWithThreshold.filter(
      (p) => p.stock_qty <= (p.low_stock_threshold || 5),
    );

    // Format data for the modal
    const formatBatch = (batch) => {
      const expDate = new Date(batch.expire_date);
      const now = new Date();
      const diffTime = Math.abs(expDate - now);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        name: batch.products?.name || "Unknown Product",
        imageUrl: batch.products?.image_url,
        expiryDate: new Date(batch.expire_date).toLocaleDateString("th-TH"),
        days: diffDays,
      };
    };

    return {
      expired: filteredExpired.map(formatBatch),
      expiringSoon: filteredSoon.map(formatBatch),
      lowStock: filteredLowStock.map((p) => ({
        name: p.name,
        imageUrl: p.image_url,
        expiryDate: "N/A",
        days: 0,
        qty: p.stock_qty,
      })),
    };
  },

  // Fetch stock movements (Sales as OUT, and potentially others if added)
  async getStockMovements(branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    try {
      const { data: sales, error: salesError } = await supabase
        .from("order_items")
        .select(
          `
          id,
          qty,
          products (name, image_url),
          orders!inner(created_at, store_id, order_no)
        `,
        )
        .eq("orders.store_id", branchId)
        .order("orders(created_at)", { ascending: false });

      if (salesError) throw salesError;

      // Transform into a unified movement format
      const movements = (sales || []).map((item) => ({
        id: `SALE-${item.id}`,
        created_at: item.orders?.created_at,
        product: item.products?.name || "ไม่ทราบชื่อสินค้า",
        imageUrl: item.products?.image_url,
        type: "OUT",
        qty: item.qty,
        note: `ออเดอร์ #${item.orders?.order_no || "N/A"}`,
      }));

      // In the future, we could also fetch from a 'stock_adjustments' or 'stock_in' table
      // and merge them here, then sort by date.

      return movements.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    } catch (error) {
      console.error("Error in getStockMovements:", error);
      throw error;
    }
  },
};

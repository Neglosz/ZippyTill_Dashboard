const { supabase } = require("../config/supabase");

const productService = {
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
      .is("deleted_at", null)
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

    const initialQty = productData.stockQty || 0;

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          barcode: productData.barcode,
          name: productData.name,
          category_id: productData.categoryId,
          price: productData.price,
          cost_price: productData.costPrice,
          stock_qty: initialQty,
          unit_type: productData.unitType || "ชิ้น",
          is_weightable: productData.isWeightable || false,
          low_stock_threshold: productData.lowStockThreshold || 0,
          image_url: productData.image_url,
          store_id: branchId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Create initial batch if expireDate is provided
    if (productData.expireDate && data?.id) {
      await supabase.from("product_batches").insert({
        product_id: data.id,
        expire_date: productData.expireDate,
        initial_qty: initialQty,
        remaining_qty: initialQty,
        batch_no: `BATCH-${Date.now()}`
      });
    }

    if (initialQty > 0 && data?.id) {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("inventory_transactions").insert({
        product_id: data.id,
        trans_type: "in",
        qty: initialQty,
        reference_type: "product_creation",
        notes: "นำเข้าสินค้าใหม่",
        store_id: branchId,
        created_by: userData?.user?.id,
        created_at: new Date().toISOString(),
      });
    }

    return data;
  },

  // Get top stock products
  async getTopStockProducts(branchId, limit = 5) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data, error } = await supabase
      .from("products")
      .select("*, product_categories(name)")
      .eq("store_id", branchId)
      .is("deleted_at", null)
      .order("stock_qty", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Update product
  async updateProduct(id, productData, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    // Explicitly map allowed product columns to avoid schema errors with extra fields
    const updateData = {};
    if (productData.name !== undefined) updateData.name = productData.name;
    if (productData.barcode !== undefined) updateData.barcode = productData.barcode;

    // Handle both camelCase and snake_case for compatibility
    const categoryId = productData.categoryId || productData.category_id;
    if (categoryId !== undefined) updateData.category_id = categoryId;

    if (productData.price !== undefined) updateData.price = productData.price;

    const costPrice = productData.costPrice || productData.cost_price;
    if (costPrice !== undefined) updateData.cost_price = costPrice;

    const stockQty = productData.stockQty || productData.stock_qty;
    if (stockQty !== undefined) updateData.stock_qty = stockQty;

    if (productData.image_url !== undefined) updateData.image_url = productData.image_url;

    const lowStockThreshold = productData.lowStockThreshold || productData.low_stock_threshold;
    if (lowStockThreshold !== undefined) updateData.low_stock_threshold = lowStockThreshold;

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .eq("store_id", branchId)
      .select()
      .single();

    if (error) throw error;

    // Handle batch update if expireDate is provided
    const expireDate = productData.expireDate;
    if (expireDate) {
      const { data: batches } = await supabase
        .from("product_batches")
        .select("*")
        .eq("product_id", id)
        .order("expire_date", { ascending: false });

      if (batches && batches.length > 0) {
        // Update the most recent batch
        await supabase
          .from("product_batches")
          .update({ expire_date: expireDate })
          .eq("id", batches[0].id);
      } else {
        // Create a new batch if none exists
        await supabase.from("product_batches").insert({
          product_id: id,
          expire_date: expireDate,
          initial_qty: data.stock_qty || 0,
          remaining_qty: data.stock_qty || 0,
          batch_no: `BATCH-${Date.now()}`
        });
      }
    }

    return data;
  },

  // Soft delete product
  async deleteProduct(id, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("store_id", branchId);

    if (error) throw error;
    return true;
  },

  // Get all categories
  async getAllCategories(branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data, error } = await supabase
      .from("product_categories")
      .select("id, name, category_type")
      .eq("store_id", branchId)
      .order("name");

    if (error) throw error;
    return data;
  },

  // Create category
  async createCategory(categoryName, branchId, categoryType = "general") {
    if (!branchId) throw new Error("Branch ID is required");
    if (!categoryName) throw new Error("Category name is required");

    const { data, error } = await supabase
      .from("product_categories")
      .insert({
        name: categoryName,
        store_id: branchId,
        category_type: categoryType,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProductBatches(productId) {
    const { data, error } = await supabase
      .from("product_batches")
      .select("*")
      .eq("product_id", productId)
      .order("expire_date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getDashboardNotifications(branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const today = new Date().toISOString().split("T")[0];
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysStr = sevenDaysFromNow.toISOString().split("T")[0];

    // Filter by branchId directly in the query using !inner
    const { data: expiredData, error: expiredError } = await supabase
      .from("product_batches")
      .select("*, products!inner(name, store_id, image_url, deleted_at)")
      .eq("products.store_id", branchId)
      .lt("expire_date", today)
      .gt("remaining_qty", 0)
      .is("products.deleted_at", null);

    if (expiredError) throw expiredError;

    const { data: soonData, error: soonError } = await supabase
      .from("product_batches")
      .select("*, products!inner(name, store_id, image_url, deleted_at)")
      .eq("products.store_id", branchId)
      .gte("expire_date", today)
      .lte("expire_date", sevenDaysStr)
      .is("products.deleted_at", null)
      .gt("remaining_qty", 0);

    if (soonError) throw soonError;

    // For low stock, we need to compare two columns (stock_qty <= low_stock_threshold).
    // PostgREST doesn't natively support column-to-column comparisons in string filters easily.
    // So we fetch products that are active and filter them in JS.
    const { data: allProducts, error: thresholdError } = await supabase
      .from("products")
      .select("name, image_url, stock_qty, unit_type, low_stock_threshold")
      .eq("store_id", branchId)
      .is("deleted_at", null);

    if (thresholdError) throw thresholdError;

    const lowStockProducts = (allProducts || []).filter(
      (p) =>
        (p.low_stock_threshold && p.stock_qty <= p.low_stock_threshold) ||
        p.stock_qty <= 5,
    );

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
      expired: (expiredData || []).map(formatBatch),
      expiringSoon: (soonData || []).map(formatBatch),
      lowStock: (lowStockProducts || []).map((p) => ({
        name: p.name,
        imageUrl: p.image_url,
        qty: p.stock_qty,
        unit: p.unit_type || "ชิ้น",
      })),
    };
  },

  async getStockMovements(branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data: sales, error: salesError } = await supabase
      .from("order_items")
      .select(
        `
        id,
        qty,
        products (name, image_url),
        orders!inner(created_at, store_id, order_no, payment_status)
      `,
      )
      .eq("orders.store_id", branchId)
      .neq("orders.payment_status", "cancelled")
      .order("orders(created_at)", { ascending: false });

    if (salesError) throw salesError;

    const movements = (sales || []).map((item) => ({
      id: `SALE-${item.id}`,
      created_at: item.orders?.created_at,
      product: item.products?.name || "ไม่ทราบชื่อสินค้า",
      imageUrl: item.products?.image_url,
      type: "OUT",
      qty: item.qty,
      note: `ออเดอร์ #${item.orders?.order_no || "N/A"}`,
    }));

    const { data: inventoryTxns, error: txnError } = await supabase
      .from("inventory_transactions")
      .select(
        `
        id,
        qty,
        trans_type,
        reference_type,
        notes,
        created_at,
        products!inner(name, image_url, store_id)
      `,
      )
      .eq("store_id", branchId)
      .order("created_at", { ascending: false });

    if (txnError) {
      console.warn("Could not fetch inventory transactions:", txnError);
    }

    const inventoryMovements = (inventoryTxns || []).map((item) => ({
      id: `TXN-${item.id}`,
      created_at: item.created_at,
      product: item.products?.name || "ได้ลบสินค้าแล้ว",
      imageUrl: item.products?.image_url,
      type: item.trans_type?.toUpperCase() || "OUT",
      qty: item.qty,
      reference_type: item.reference_type,
      note: item.notes || "ปรับสต็อก",
    }));

    const allMovements = [...movements, ...inventoryMovements];
    return allMovements.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  },

  async recordStockRemoval(removalData, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("inventory_transactions")
      .insert({
        product_id: removalData.productId,
        trans_type: "out",
        qty: removalData.qty,
        reference_type: "product_deletion",
        notes: removalData.reason,
        store_id: branchId,
        created_by: userData?.user?.id,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
    return data;
  },
};

module.exports = productService;

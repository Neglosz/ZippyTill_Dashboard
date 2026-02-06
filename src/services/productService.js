import { supabase } from "../lib/supabase";

export const productService = {
  // Get all products with category info
  async getAllProducts() {
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
      .order("name");

    if (error) throw error;
    return data;
  },

  // Get single product
  async getProductById(id) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new product
  async createProduct(productData) {
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
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update product
  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete product
  async deleteProduct(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) throw error;
    return true;
  },

  // Get all categories
  async getAllCategories() {
    const { data, error } = await supabase
      .from("product_categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  },

  // Get batches for a product (to get expiry date)
  async getProductBatches(productId) {
    const { data, error } = await supabase
      .from("product_batches")
      .select("*")
      .eq("product_id", productId)
      .order("expire_date", { ascending: false });

    if (error) throw error;
    return data;
  },
};

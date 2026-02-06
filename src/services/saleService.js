import { supabase } from "../lib/supabase";

export const saleService = {
    // Get top selling products with real sales data from order_items
    getTopSellingProducts: async () => {
        try {
            console.log("Fetching top selling products...");

            // Try 'product' table first (as requested by user)
            let { data: products, error: prodError } = await supabase.from("product").select(`
                    *,
                    product_categories (name),
                    order_items (qty, subtotal)
                `);

            // If 'product' fails OR is empty, try 'products' (plural) as fallback
            if (prodError || !products || products.length === 0) {
                if (prodError)
                    console.log("Singular 'product' fetch error:", prodError.message);
                console.log("Trying 'products' table as fallback...");
                const { data: pluralData, error: pluralError } = await supabase
                    .from("products")
                    .select(`
                        *,
                        product_categories (name),
                        order_items (qty, subtotal)
                    `);

                if (!pluralError && pluralData) {
                    products = pluralData;
                } else if (pluralError && prodError) {
                    // If both fail, throw the first error
                    throw prodError;
                }
            }

            if (!products || products.length === 0) {
                console.log("No products found in either table.");
                return [];
            }

            // Process data to calculate totals from joined order_items
            const processedProducts = products.map((p) => {
                const totalSold = (p.order_items || []).reduce(
                    (sum, item) => sum + (item.qty || 0),
                    0
                );
                const totalRevenue = (p.order_items || []).reduce(
                    (sum, item) => sum + (item.subtotal || 0),
                    0
                );
                return {
                    ...p,
                    sold_qty: totalSold,
                    revenue: totalRevenue,
                };
            });

            // Sort by sold quantity and take top 5
            const top5 = processedProducts
                .sort((a, b) => b.sold_qty - a.sold_qty)
                .slice(0, 5);

            console.log("Successfully processed Top 5 products:", top5.length);
            return top5;
        } catch (error) {
            console.error("saleService getTopSellingProducts error:", error);
            throw error;
        }
    },

    getProducts: async () => {
        try {
            console.log("Fetching all products...");
            let { data, error } = await supabase
                .from("product")
                .select(`*, product_categories (name)`)
                .order("name", { ascending: true });

            if (error || !data) {
                const { data: pluralData, error: pluralError } = await supabase
                    .from("products")
                    .select(`*, product_categories (name)`)
                    .order("name", { ascending: true });
                if (pluralError) throw pluralError;
                data = pluralData;
            }
            return data;
        } catch (error) {
            console.error("saleService getProducts error:", error);
            throw error;
        }
    },

    getSalesByCategory: async () => {
        try {
            console.log("Fetching sales by category...");

            let { data: products, error: prodError } = await supabase
                .from("product")
                .select(`
                    id,
                    product_categories (id, name),
                    order_items (qty, subtotal)
                `);

            if (prodError || !products || products.length === 0) {
                const { data: pluralData, error: pluralError } = await supabase
                    .from("products")
                    .select(`
                        id,
                        product_categories (id, name),
                        order_items (qty, subtotal)
                    `);
                if (pluralError) throw pluralError;
                products = pluralData;
            }

            const categoryMap = {};

            products.forEach((p) => {
                const cat = p.product_categories;
                const catName = cat ? cat.name : "อื่นๆ";
                const totalRevenue = (p.order_items || []).reduce(
                    (sum, item) => sum + (item.subtotal || 0),
                    0
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

    getSalesSummary: async () => {
        try {
            console.log("Fetching sales summary (Total Products & Total Sold)...");

            // 1. Get Total Products count (handling singular/plural table names)
            let { count: productCount, error: prodError } = await supabase
                .from("product")
                .select("*", { count: "exact", head: true });

            if (prodError || productCount === null) {
                const { count: pluralCount, error: pluralError } = await supabase
                    .from("products")
                    .select("*", { count: "exact", head: true });

                if (pluralError) throw pluralError;
                productCount = pluralCount;
            }

            // 2. Get Total Product Sold (sum of qty in order_items)
            const { data: items, error: itemsError } = await supabase
                .from("order_items")
                .select("qty");

            if (itemsError) throw itemsError;

            const totalSold = (items || []).reduce((sum, item) => sum + (item.qty || 0), 0);

            return {
                totalProducts: productCount || 0,
                totalSold: totalSold,
            };
        } catch (error) {
            console.error("saleService getSalesSummary error:", error);
            throw error;
        }
    },
};

import { supabase } from "../lib/supabase";
export const saleService = {
    // Get top selling products with real sales data from order_items
    getTopSellingProducts: async () => {
        try {
            console.log("Fetching top selling products...");

            // Try 'product' table first (as requested by user)
            let { data: products, error: prodError } = await supabase
                .from("product")
                .select(`
                    *,
                    product_categories (name),
                    order_items (qty, subtotal)
                `);

            // If 'product' fails OR is empty, try 'products' (plural) as fallback
            if (prodError || !products || products.length === 0) {
                if (prodError) console.log("Singular 'product' fetch error:", prodError.message);
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
            const processedProducts = products.map(p => {
                const totalSold = (p.order_items || []).reduce((sum, item) => sum + (item.qty || 0), 0);
                const totalRevenue = (p.order_items || []).reduce((sum, item) => sum + (item.subtotal || 0), 0);
                return {
                    ...p,
                    sold_qty: totalSold,
                    revenue: totalRevenue
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
};



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

            products.forEach(p => {
                const cat = p.product_categories;
                const catName = cat ? cat.name : "อื่นๆ";
                const items = p.order_items || [];
                const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);
                const totalRevenue = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

                if (!categoryMap[catName]) {
                    categoryMap[catName] = { name: catName, value: 0, revenue: 0 };
                }
                categoryMap[catName].value += totalQty;
                categoryMap[catName].revenue += totalRevenue;
            });

            // Convert to array and filter out zero values if needed, or just return all
            return Object.values(categoryMap);
        } catch (error) {
            console.error("saleService getSalesByCategory error:", error);
            throw error;
        }
    },

    getSalesHistoryByCategory: async (range) => {
        try {
            console.log("Fetching sales history for range:", range);

            // Fetch order items with their category and timestamp
            // We use products table to get the category
            const { data: rawItems, error } = await supabase
                .from("order_items")
                .select(`
                    subtotal,
                    created_at,
                    product:product (
                        product_categories (name)
                    )
                `);

            // Fallback for plural table name if singular fails
            let items = rawItems;
            if (error || !items) {
                const { data: pluralData, error: pluralError } = await supabase
                    .from("order_items")
                    .select(`
                        subtotal,
                        created_at,
                        product:products (
                            product_categories (name)
                        )
                    `);
                if (pluralError) throw pluralError;
                items = pluralData;
            }

            if (!items) return [];

            // Process items into time buckets based on range
            const now = new Date();
            const result = [];

            // Define bucketing logic
            const formatBucket = (date) => {
                if (range === "1D") return date.getHours().toString().padStart(2, "0") + ":00";
                if (range === "1M") return date.getDate().toString();
                if (range === "1Y") return date.toLocaleString("th-TH", { month: "short" });
                return date.getFullYear().toString();
            };

            // Filter items by range
            const filteredItems = items.filter(item => {
                const itemDate = new Date(item.created_at);
                if (range === "1D") return itemDate.toDateString() === now.toDateString();
                if (range === "1M") return (now - itemDate) <= 30 * 24 * 60 * 60 * 1000;
                if (range === "1Y") return (now - itemDate) <= 365 * 24 * 60 * 60 * 1000;
                return true; // MAX
            });

            // Bucket the data
            const buckets = {};
            filteredItems.forEach(item => {
                const bucket = formatBucket(new Date(item.created_at));
                const catName = item.product?.product_categories?.name || "อื่นๆ";

                if (!buckets[bucket]) buckets[bucket] = { name: bucket };
                if (!buckets[bucket][catName]) buckets[bucket][catName] = 0;
                buckets[bucket][catName] += item.subtotal || 0;
            });

            // Ensure buckets are sorted and filled (optional, but good for charts)
            return Object.values(buckets).sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error("saleService getSalesHistoryByCategory error:", error);
            throw error;
        }
    },
};



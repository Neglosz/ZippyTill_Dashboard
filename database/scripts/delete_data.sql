TRUNCATE TABLE 
    -- 1. Transactional & Log Data
    public.order_items,
    public.payments,
    public.orders,
    public.inventory_transactions,
    public.account_transactions,
    public.credit_accounts,
    public.sync_queue,
    public.backup_logs,

    -- 2. Promotions & Master Data
    public.promotion_items,
    public.promotions,
    public.product_batches,
    public.products,
    public.product_categories,

    -- 3. Customer & Interaction Data
    public.customers_info,
    public.ai_recommendations,
    public.notifications,

    -- 4. Store & User Configuration
    public.store_settings,
    public.store_order_counters,
    public.store_credentials,
    public.store_members,
    public.profiles,
    public.stores
RESTART IDENTITY CASCADE;

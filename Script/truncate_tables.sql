-- สคริปต์ลบข้อมูลทั้งหมดใน Table โดยไม่ลบโครงสร้าง Table
-- คำเตือน: ข้อมูลที่ถูกลบไปแล้วไม่สามารถกู้คืนได้

TRUNCATE TABLE 
    public.order_items,
    public.payments,
    public.credit_accounts,
    public.inventory_transactions,
    public.account_transactions,
    public.ai_recommendations,
    public.notifications,
    public.backup_logs,
    public.promotion_items,
    public.promotions,
    public.product_batches,
    public.products,
    public.product_categories,
    public.orders,
    public.store_order_counters,
    public.customers_info,
    public.store_credentials,
    public.store_members,
    public.profiles,
    public.stores,
    public.sync_queue
RESTART IDENTITY CASCADE;

-- Migration: 005_log_new_product_trigger
-- Description: Automatically log an inventory transaction whenever a new product is created.
-- This ensures products added from Mobile (direct Supabase) show up in Stock Reports.

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION log_new_product_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into inventory_transactions
  INSERT INTO inventory_transactions (
    product_id,
    store_id,
    trans_type,
    qty,
    reference_type,
    notes,
    created_at
  ) VALUES (
    NEW.id,
    NEW.store_id,
    'in',
    COALESCE(NEW.stock_qty, 0),
    'product_creation',
    CASE 
      WHEN NEW.stock_qty > 0 THEN 'นำเข้าสินค้าใหม่ (อัตโนมัติ)' 
      ELSE 'เพิ่มสินค้าใหม่ (ยังไม่มีสต็อก)' 
    END,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the trigger on the products table
-- DROP TRIGGER IF EXISTS trg_log_new_product ON products;
CREATE TRIGGER trg_log_new_product
AFTER INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION log_new_product_transaction();

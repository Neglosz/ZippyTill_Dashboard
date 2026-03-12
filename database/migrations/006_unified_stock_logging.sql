-- Migration: 006_unified_stock_logging
-- Description: Handles both initial creation and manual stock updates for all platforms (Web/Mobile).

-- 1. Create the unified trigger function
CREATE OR REPLACE FUNCTION log_product_stock_change()
RETURNS TRIGGER AS $$
DECLARE
    diff NUMERIC;
BEGIN
    -- CASE 1: New Product Created
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO inventory_transactions (
            product_id, store_id, trans_type, qty, reference_type, notes, created_at
        ) VALUES (
            NEW.id, NEW.store_id, 'in', COALESCE(NEW.stock_qty, 0), 'product_creation',
            CASE WHEN NEW.stock_qty > 0 THEN 'นำเข้าสินค้าใหม่ (อัตโนมัติ)' ELSE 'เพิ่มสินค้าใหม่ (ยังไม่มีสต็อก)' END,
            NOW()
        );
        
    -- CASE 2: Stock Quantity Updated (e.g. 20 -> 40)
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (NEW.stock_qty <> OLD.stock_qty) THEN
            diff := NEW.stock_qty - OLD.stock_qty;
            
            INSERT INTO inventory_transactions (
                product_id, store_id, trans_type, qty, reference_type, notes, created_at
            ) VALUES (
                NEW.id, NEW.store_id, 
                CASE WHEN diff > 0 THEN 'in' ELSE 'out' END,
                ABS(diff),
                'manual_update',
                'ปรับปรุงสต็อก (จาก ' || OLD.stock_qty || ' เป็น ' || NEW.stock_qty || ')',
                NOW()
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Cleanup old triggers to avoid duplicates
DROP TRIGGER IF EXISTS trg_log_new_product ON products;
DROP TRIGGER IF EXISTS trg_log_product_change ON products;

-- 3. Bind the trigger to the products table
CREATE TRIGGER trg_log_product_change
AFTER INSERT OR UPDATE OF stock_qty ON products
FOR EACH ROW
EXECUTE FUNCTION log_product_stock_change();

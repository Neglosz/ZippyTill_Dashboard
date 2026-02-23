-- Migration: Add store_id to inventory_transactions for reliable branch filtering
-- Run this in Supabase SQL Editor

-- 1. Add store_id column (nullable first to allow backfill)
ALTER TABLE inventory_transactions
ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);

-- 2. Backfill existing rows from linked products table
UPDATE inventory_transactions it
SET store_id = p.store_id
FROM products p
WHERE it.product_id = p.id
  AND it.store_id IS NULL;

-- 3. (Optional) Add index for performance
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_store_id
  ON inventory_transactions(store_id);

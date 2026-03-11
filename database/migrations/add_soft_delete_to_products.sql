-- Add deleted_at column to products table for soft delete
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);

-- Optional: Create a view to easily query active (non-deleted) products
CREATE OR REPLACE VIEW active_products AS
SELECT * FROM products WHERE deleted_at IS NULL;

COMMENT ON COLUMN products.deleted_at IS 'Timestamp when product was soft-deleted. NULL means product is active.';

-- IMPORTANT: Run this in Supabase SQL Editor
-- This script ONLY inserts test data. It checks if tables exist but assuming they do.

-- 1. Insert Customers and capture IDs
WITH new_customers AS (
  INSERT INTO customers_info (name, phone, total_debt)
  VALUES 
    ('วินัย มานะสมชื่อ', '083-123-4567', 250.00),
    ('สมชาย ใจดี', '089-999-9999', 1500.00),
    ('มานี มีแชร์', '081-555-4444', 4500.50),
    ('สมปอง ลองของ', '081-111-2222', 1000.00)
  RETURNING id, name
)

-- 2. Insert Credit Accounts linked to the new Customers
INSERT INTO credit_accounts (customer_id, total_debt, paid_amount, remaining_amount, due_date, status, order_id)
SELECT 
  id,
  CASE 
    WHEN name = 'วินัย มานะสมชื่อ' THEN 500.00
    WHEN name = 'สมชาย ใจดี' THEN 1500.00
    WHEN name = 'มานี มีแชร์' THEN 5000.00
    WHEN name = 'สมปอง ลองของ' THEN 1000.00
  END,
  CASE 
    WHEN name = 'วินัย มานะสมชื่อ' THEN 250.00
    WHEN name = 'สมชาย ใจดี' THEN 0.00
    WHEN name = 'มานี มีแชร์' THEN 499.50
    WHEN name = 'สมปอง ลองของ' THEN 0.00
  END,
  CASE 
    WHEN name = 'วินัย มานะสมชื่อ' THEN 250.00
    WHEN name = 'สมชาย ใจดี' THEN 1500.00
    WHEN name = 'มานี มีแชร์' THEN 4500.50
    WHEN name = 'สมปอง ลองของ' THEN 1000.00
  END,
  CASE 
    WHEN name = 'วินัย มานะสมชื่อ' THEN CURRENT_DATE - 7  -- Overdue 7 days
    WHEN name = 'สมชาย ใจดี' THEN CURRENT_DATE       -- Due Today
    WHEN name = 'มานี มีแชร์' THEN CURRENT_DATE - 30 -- Overdue 30 days
    WHEN name = 'สมปอง ลองของ' THEN CURRENT_DATE - 5 -- Overdue 5 days
  END,
  'ค้างชำระ',
  gen_random_uuid()
FROM new_customers;

-- 3. Insert Notifications
INSERT INTO notifications (title, message, type, is_read, category)
VALUES
  ('เกินกำหนดชำระ 7 วัน', 'คุณ วินัย มานะสมชื่อ ค้างชำระ ฿250.00', 'alert', false, 'payment_reminder'),
  ('ใกล้ถึงกำหนดชำระ', 'คุณ สมชาย ใจดี ครบกำหนดวันนี้', 'warning', false, 'payment_reminder');

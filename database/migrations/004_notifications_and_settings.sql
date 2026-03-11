-- Migration: Add persistent notifications and store settings
-- Run this in Supabase SQL Editor

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'low_stock', 'expiry', 'system'
  message TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast retrieval by store and unread status
CREATE INDEX IF NOT EXISTS idx_notifications_store_read 
  ON system_notifications(store_id, is_read, created_at DESC);

-- 2. Create store_settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, key)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_store_settings_lookup
  ON store_settings(store_id, key);

-- Trigger to update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_store_settings_updated_at
    BEFORE UPDATE ON store_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

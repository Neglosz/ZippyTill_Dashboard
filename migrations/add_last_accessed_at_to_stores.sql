-- Migration: Add last_accessed_at column to stores table
-- Run this in Supabase SQL Editor

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;

-- Index for fast ordering
CREATE INDEX IF NOT EXISTS idx_stores_last_accessed_at
  ON stores(last_accessed_at DESC NULLS LAST);

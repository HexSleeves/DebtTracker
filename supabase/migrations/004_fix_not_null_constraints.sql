-- Fix NOT NULL constraints for foreign key columns
-- This migration ensures that foreign key columns are properly constrained

-- Update debts table to make user_id NOT NULL
-- (This should already be the case, but ensuring consistency)
ALTER TABLE debts ALTER COLUMN user_id SET NOT NULL;

-- Update payments table to make debt_id NOT NULL
-- (This should already be the case, but ensuring consistency)
ALTER TABLE payments ALTER COLUMN debt_id SET NOT NULL;

-- Update payment_plans table to make user_id NOT NULL
-- (This should already be the case, but ensuring consistency)
ALTER TABLE payment_plans ALTER COLUMN user_id SET NOT NULL;

-- Add comments to document the constraints
COMMENT ON COLUMN debts.user_id IS 'Foreign key to users table - every debt must belong to a user';
COMMENT ON COLUMN payments.debt_id IS 'Foreign key to debts table - every payment must belong to a debt';
COMMENT ON COLUMN payment_plans.user_id IS 'Foreign key to users table - every payment plan must belong to a user';

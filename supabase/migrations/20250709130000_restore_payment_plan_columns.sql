-- Restore missing columns to payment_plans table
-- This migration adds back the columns that were removed but are still needed by the application

-- Add name column with a default value for existing records
ALTER TABLE "public"."payment_plans" 
ADD COLUMN "name" TEXT NOT NULL DEFAULT 'Payment Plan';

-- Add extra_payment column
ALTER TABLE "public"."payment_plans" 
ADD COLUMN "extra_payment" DECIMAL(10,2) NOT NULL DEFAULT 0 
CHECK (extra_payment >= 0);

-- Add target_date column
ALTER TABLE "public"."payment_plans" 
ADD COLUMN "target_date" DATE;

-- Rename active column back to is_active for consistency with application code
ALTER TABLE "public"."payment_plans" 
RENAME COLUMN "active" TO "is_active";

-- Update the indexes to use the renamed column
DROP INDEX IF EXISTS "public"."idx_active_payment_plans";
DROP INDEX IF EXISTS "public"."idx_payment_plans_active";

-- Recreate indexes with the correct column name
CREATE INDEX idx_payment_plans_is_active ON public.payment_plans USING btree (is_active);
CREATE INDEX idx_active_payment_plans ON public.payment_plans USING btree (clerk_user_id, is_active) WHERE (is_active = true);

-- Add comments to document the restored columns
COMMENT ON COLUMN payment_plans.name IS 'User-defined name for the payment plan';
COMMENT ON COLUMN payment_plans.extra_payment IS 'Additional payment amount beyond minimum payments';
COMMENT ON COLUMN payment_plans.target_date IS 'Target date for debt payoff (optional)';
COMMENT ON COLUMN payment_plans.is_active IS 'Whether this payment plan is currently active';

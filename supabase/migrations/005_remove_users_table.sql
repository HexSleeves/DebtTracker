-- Drop all RLS policies that depend on user_id
DROP POLICY IF EXISTS "Users can view own debts" ON debts;
DROP POLICY IF EXISTS "Users can insert own debts" ON debts;
DROP POLICY IF EXISTS "Users can update own debts" ON debts;
DROP POLICY IF EXISTS "Users can delete own debts" ON debts;

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;
DROP POLICY IF EXISTS "Users can delete own payments" ON payments;

DROP POLICY IF EXISTS "Users can view own payment plans" ON payment_plans;
DROP POLICY IF EXISTS "Users can insert own payment plans" ON payment_plans;
DROP POLICY IF EXISTS "Users can update own payment plans" ON payment_plans;
DROP POLICY IF EXISTS "Users can delete own payment plans" ON payment_plans;

-- Remove foreign key constraints
ALTER TABLE debts DROP CONSTRAINT IF EXISTS debts_user_id_fkey;
ALTER TABLE payment_plans DROP CONSTRAINT IF EXISTS payment_plans_user_id_fkey;

-- Update debts table to use clerk_user_id directly
ALTER TABLE debts DROP COLUMN user_id;
ALTER TABLE debts ADD COLUMN clerk_user_id TEXT NOT NULL DEFAULT '';

-- Update payment_plans table to use clerk_user_id directly  
ALTER TABLE payment_plans DROP COLUMN user_id;
ALTER TABLE payment_plans ADD COLUMN clerk_user_id TEXT NOT NULL DEFAULT '';

-- Drop the users table
DROP TABLE users;

-- Recreate RLS policies using clerk_user_id
-- Note: We'll use auth.jwt() to get the Clerk user ID from the JWT token

-- Enable RLS on tables
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;

-- Debts policies
CREATE POLICY "Users can view own debts" ON debts
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own debts" ON debts
  FOR INSERT WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own debts" ON debts
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own debts" ON debts
  FOR DELETE USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Payments policies (check both payment ownership and debt ownership)
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM debts 
      WHERE debts.id = payments.debt_id 
      AND debts.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM debts 
      WHERE debts.id = payments.debt_id 
      AND debts.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM debts 
      WHERE debts.id = payments.debt_id 
      AND debts.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete own payments" ON payments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM debts 
      WHERE debts.id = payments.debt_id 
      AND debts.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Payment plans policies
CREATE POLICY "Users can view own payment plans" ON payment_plans
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own payment plans" ON payment_plans
  FOR INSERT WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own payment plans" ON payment_plans
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own payment plans" ON payment_plans
  FOR DELETE USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Add indexes for performance
CREATE INDEX idx_debts_clerk_user_id ON debts(clerk_user_id);
CREATE INDEX idx_payment_plans_clerk_user_id ON payment_plans(clerk_user_id);
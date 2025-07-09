-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can only see and modify their own record
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

-- Debts table policies
-- Users can only access their own debts
CREATE POLICY "Users can view own debts" ON debts
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own debts" ON debts
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own debts" ON debts
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete own debts" ON debts
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Payments table policies
-- Users can only access payments for their own debts
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    debt_id IN (
      SELECT d.id FROM debts d
      JOIN users u ON d.user_id = u.id
      WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (
    debt_id IN (
      SELECT d.id FROM debts d
      JOIN users u ON d.user_id = u.id
      WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (
    debt_id IN (
      SELECT d.id FROM debts d
      JOIN users u ON d.user_id = u.id
      WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete own payments" ON payments
  FOR DELETE USING (
    debt_id IN (
      SELECT d.id FROM debts d
      JOIN users u ON d.user_id = u.id
      WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Payment plans table policies
-- Users can only access their own payment plans
CREATE POLICY "Users can view own payment plans" ON payment_plans
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own payment plans" ON payment_plans
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own payment plans" ON payment_plans
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete own payment plans" ON payment_plans
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Create a function to get current user ID from Clerk JWT
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM users
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

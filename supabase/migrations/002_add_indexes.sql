-- Indexes for users table
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_users_email ON users(email);

-- Indexes for debts table
CREATE INDEX idx_debts_user_id ON debts(user_id);
CREATE INDEX idx_debts_type ON debts(type);
CREATE INDEX idx_debts_due_date ON debts(due_date);
CREATE INDEX idx_debts_balance ON debts(balance);
CREATE INDEX idx_debts_interest_rate ON debts(interest_rate);

-- Indexes for payments table
CREATE INDEX idx_payments_debt_id ON payments(debt_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_type ON payments(type);

-- Indexes for payment_plans table
CREATE INDEX idx_payment_plans_user_id ON payment_plans(user_id);
CREATE INDEX idx_payment_plans_active ON payment_plans(is_active);
CREATE INDEX idx_payment_plans_strategy ON payment_plans(strategy);

-- Composite indexes for common queries
CREATE INDEX idx_debts_user_balance ON debts(user_id, balance DESC);
CREATE INDEX idx_debts_user_interest ON debts(user_id, interest_rate DESC);
CREATE INDEX idx_payments_debt_date ON payments(debt_id, payment_date DESC);
CREATE INDEX idx_active_payment_plans ON payment_plans(user_id, is_active) WHERE is_active = true;

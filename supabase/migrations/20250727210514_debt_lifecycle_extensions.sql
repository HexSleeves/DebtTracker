-- Migration: Debt Lifecycle Extensions
-- Description: Add debt status, milestones, payment recommendations, and enhanced payment tracking

-- 1. Extend debts table with lifecycle status and completion fields
ALTER TABLE public.debts 
ADD COLUMN status text DEFAULT 'active' NOT NULL,
ADD COLUMN paid_off_date timestamp with time zone,
ADD COLUMN total_interest_paid numeric(12,2) DEFAULT 0 NOT NULL,
ADD COLUMN total_payments_made integer DEFAULT 0 NOT NULL;

-- Add constraint for debt status
ALTER TABLE public.debts 
ADD CONSTRAINT debts_status_check 
CHECK (status IN ('active', 'paid_off', 'archived'));

-- Add constraint for paid_off_date (should only be set when status is paid_off)
ALTER TABLE public.debts 
ADD CONSTRAINT debts_paid_off_date_check 
CHECK ((status = 'paid_off' AND paid_off_date IS NOT NULL) OR (status != 'paid_off' AND paid_off_date IS NULL));

-- Add indexes for new debt fields
CREATE INDEX idx_debts_status ON public.debts USING btree (status);
CREATE INDEX idx_debts_paid_off_date ON public.debts USING btree (paid_off_date) WHERE paid_off_date IS NOT NULL;

-- 2. Create debt_milestones table
CREATE TABLE public.debt_milestones (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    debt_id uuid NOT NULL,
    milestone_type text NOT NULL,
    achieved_date timestamp with time zone DEFAULT now() NOT NULL,
    milestone_value numeric(12,2) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT debt_milestones_pkey PRIMARY KEY (id),
    CONSTRAINT debt_milestones_debt_id_fkey FOREIGN KEY (debt_id) REFERENCES public.debts(id) ON DELETE CASCADE,
    CONSTRAINT debt_milestones_milestone_type_check CHECK (milestone_type IN (
        'created', 'first_payment', '25_percent_paid', '50_percent_paid', 
        '75_percent_paid', 'paid_off', 'custom'
    )),
    CONSTRAINT debt_milestones_milestone_value_check CHECK (milestone_value >= 0)
);

-- Add indexes for debt_milestones
CREATE INDEX idx_debt_milestones_debt_id ON public.debt_milestones USING btree (debt_id);
CREATE INDEX idx_debt_milestones_type ON public.debt_milestones USING btree (milestone_type);
CREATE INDEX idx_debt_milestones_achieved_date ON public.debt_milestones USING btree (achieved_date);
CREATE UNIQUE INDEX idx_debt_milestones_unique_type ON public.debt_milestones USING btree (debt_id, milestone_type);

-- 3. Create payment_recommendations table
CREATE TABLE public.payment_recommendations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    clerk_user_id text NOT NULL,
    debt_id uuid,
    recommendation_type text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    recommended_amount numeric(10,2) NOT NULL,
    reasoning text NOT NULL,
    priority text DEFAULT 'medium' NOT NULL,
    is_applied boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    CONSTRAINT payment_recommendations_pkey PRIMARY KEY (id),
    CONSTRAINT payment_recommendations_debt_id_fkey FOREIGN KEY (debt_id) REFERENCES public.debts(id) ON DELETE CASCADE,
    CONSTRAINT payment_recommendations_type_check CHECK (recommendation_type IN (
        'strategy_optimal', 'extra_payment', 'rate_change_alert', 
        'milestone_opportunity', 'budget_optimization'
    )),
    CONSTRAINT payment_recommendations_priority_check CHECK (priority IN ('low', 'medium', 'high')),
    CONSTRAINT payment_recommendations_amount_check CHECK (recommended_amount >= 0)
);

-- Add indexes for payment_recommendations
CREATE INDEX idx_payment_recommendations_user_id ON public.payment_recommendations USING btree (clerk_user_id);
CREATE INDEX idx_payment_recommendations_debt_id ON public.payment_recommendations USING btree (debt_id);
CREATE INDEX idx_payment_recommendations_type ON public.payment_recommendations USING btree (recommendation_type);
CREATE INDEX idx_payment_recommendations_priority ON public.payment_recommendations USING btree (priority);
CREATE INDEX idx_payment_recommendations_active ON public.payment_recommendations USING btree (clerk_user_id, is_applied, expires_at) WHERE is_applied = false;

-- 4. Enhance payments table with balance tracking and payment breakdown fields
ALTER TABLE public.payments 
ADD COLUMN balance_after_payment numeric(12,2),
ADD COLUMN interest_portion numeric(10,2) DEFAULT 0 NOT NULL,
ADD COLUMN principal_portion numeric(10,2) DEFAULT 0 NOT NULL,
ADD COLUMN payment_method text DEFAULT 'manual' NOT NULL,
ADD COLUMN notes text;

-- Add constraints for payment enhancements
ALTER TABLE public.payments 
ADD CONSTRAINT payments_balance_after_check CHECK (balance_after_payment >= 0),
ADD CONSTRAINT payments_interest_portion_check CHECK (interest_portion >= 0),
ADD CONSTRAINT payments_principal_portion_check CHECK (principal_portion >= 0),
ADD CONSTRAINT payments_method_check CHECK (payment_method IN ('manual', 'automatic', 'recommended'));

-- Add constraint to ensure interest + principal = amount
ALTER TABLE public.payments 
ADD CONSTRAINT payments_portion_sum_check CHECK (
    abs((interest_portion + principal_portion) - amount) < 0.01
);

-- Add indexes for enhanced payment fields
CREATE INDEX idx_payments_balance_after ON public.payments USING btree (balance_after_payment);
CREATE INDEX idx_payments_method ON public.payments USING btree (payment_method);

-- 5. Database functions for milestone detection and progress calculations

-- Function to calculate debt progress percentage
CREATE OR REPLACE FUNCTION public.calculate_debt_progress(debt_id_param uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    original_balance numeric;
    current_balance numeric;
    progress_percentage numeric;
BEGIN
    SELECT original_balance, balance 
    INTO original_balance, current_balance
    FROM public.debts 
    WHERE id = debt_id_param;
    
    IF original_balance IS NULL OR original_balance = 0 THEN
        RETURN 0;
    END IF;
    
    progress_percentage := ((original_balance - current_balance) / original_balance) * 100;
    RETURN GREATEST(0, LEAST(100, progress_percentage));
END;
$$;

-- Function to detect and create milestones
CREATE OR REPLACE FUNCTION public.detect_and_create_milestones(debt_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    debt_record record;
    progress_pct numeric;
    milestone_types text[] := ARRAY['25_percent_paid', '50_percent_paid', '75_percent_paid'];
    milestone_type text;
    milestone_threshold numeric;
BEGIN
    -- Get debt information
    SELECT * INTO debt_record FROM public.debts WHERE id = debt_id_param;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Calculate progress percentage
    progress_pct := public.calculate_debt_progress(debt_id_param);
    
    -- Check each milestone threshold
    FOREACH milestone_type IN ARRAY milestone_types
    LOOP
        CASE milestone_type
            WHEN '25_percent_paid' THEN milestone_threshold := 25;
            WHEN '50_percent_paid' THEN milestone_threshold := 50;
            WHEN '75_percent_paid' THEN milestone_threshold := 75;
        END CASE;
        
        -- Create milestone if threshold reached and not already exists
        IF progress_pct >= milestone_threshold THEN
            INSERT INTO public.debt_milestones (debt_id, milestone_type, milestone_value, description)
            VALUES (
                debt_id_param,
                milestone_type,
                debt_record.balance,
                format('%s%% of debt paid off', milestone_threshold::text)
            )
            ON CONFLICT (debt_id, milestone_type) DO NOTHING;
        END IF;
    END LOOP;
    
    -- Check for paid_off milestone
    IF debt_record.balance = 0 AND debt_record.status = 'paid_off' THEN
        INSERT INTO public.debt_milestones (debt_id, milestone_type, milestone_value, description)
        VALUES (
            debt_id_param,
            'paid_off',
            0,
            'Debt fully paid off'
        )
        ON CONFLICT (debt_id, milestone_type) DO NOTHING;
    END IF;
END;
$$;

-- Function to calculate payment breakdown (interest vs principal)
CREATE OR REPLACE FUNCTION public.calculate_payment_breakdown(
    debt_id_param uuid,
    payment_amount numeric,
    payment_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE(interest_portion numeric, principal_portion numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    debt_record record;
    monthly_interest_rate numeric;
    days_since_last_payment integer;
    interest_amount numeric;
    principal_amount numeric;
    last_payment_date date;
BEGIN
    -- Get debt information
    SELECT * INTO debt_record FROM public.debts WHERE id = debt_id_param;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 0::numeric, payment_amount;
        RETURN;
    END IF;
    
    -- Get last payment date
    SELECT MAX(payment_date) INTO last_payment_date
    FROM public.payments 
    WHERE debt_id = debt_id_param;
    
    -- If no previous payments, use debt creation date
    IF last_payment_date IS NULL THEN
        last_payment_date := debt_record.created_at::date;
    END IF;
    
    -- Calculate days since last payment
    days_since_last_payment := payment_date - last_payment_date;
    
    -- Calculate monthly interest rate (annual rate / 12)
    monthly_interest_rate := debt_record.interest_rate / 100 / 12;
    
    -- Calculate interest for the period (simplified daily compounding)
    interest_amount := debt_record.balance * monthly_interest_rate * (days_since_last_payment / 30.0);
    interest_amount := GREATEST(0, LEAST(interest_amount, payment_amount));
    
    -- Principal is the remainder
    principal_amount := payment_amount - interest_amount;
    
    RETURN QUERY SELECT interest_amount, principal_amount;
END;
$$;

-- Function to update debt balance and trigger milestone detection
CREATE OR REPLACE FUNCTION public.process_payment_and_update_debt(
    debt_id_param uuid,
    payment_amount numeric,
    payment_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE(new_balance numeric, milestones_triggered integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    debt_record record;
    new_balance_value numeric;
    milestones_before integer;
    milestones_after integer;
BEGIN
    -- Get current debt
    SELECT * INTO debt_record FROM public.debts WHERE id = debt_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Debt not found';
    END IF;
    
    -- Calculate new balance
    new_balance_value := GREATEST(0, debt_record.balance - payment_amount);
    
    -- Count milestones before
    SELECT COUNT(*) INTO milestones_before 
    FROM public.debt_milestones 
    WHERE debt_id = debt_id_param;
    
    -- Update debt balance and payment count
    UPDATE public.debts 
    SET 
        balance = new_balance_value,
        total_payments_made = total_payments_made + 1,
        status = CASE WHEN new_balance_value = 0 THEN 'paid_off' ELSE status END,
        paid_off_date = CASE WHEN new_balance_value = 0 THEN now() ELSE paid_off_date END,
        updated_at = now()
    WHERE id = debt_id_param;
    
    -- Detect and create milestones
    PERFORM public.detect_and_create_milestones(debt_id_param);
    
    -- Count milestones after
    SELECT COUNT(*) INTO milestones_after 
    FROM public.debt_milestones 
    WHERE debt_id = debt_id_param;
    
    RETURN QUERY SELECT new_balance_value, (milestones_after - milestones_before);
END;
$$;

-- Row Level Security policies for new tables

-- debt_milestones policies
ALTER TABLE public.debt_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view milestones for own debts" ON public.debt_milestones
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.debts 
        WHERE debts.id = debt_milestones.debt_id 
        AND debts.clerk_user_id = (auth.jwt() ->> 'sub')
    )
);

CREATE POLICY "Users can insert milestones for own debts" ON public.debt_milestones
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.debts 
        WHERE debts.id = debt_milestones.debt_id 
        AND debts.clerk_user_id = (auth.jwt() ->> 'sub')
    )
);

CREATE POLICY "Users can update milestones for own debts" ON public.debt_milestones
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.debts 
        WHERE debts.id = debt_milestones.debt_id 
        AND debts.clerk_user_id = (auth.jwt() ->> 'sub')
    )
);

CREATE POLICY "Users can delete milestones for own debts" ON public.debt_milestones
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.debts 
        WHERE debts.id = debt_milestones.debt_id 
        AND debts.clerk_user_id = (auth.jwt() ->> 'sub')
    )
);

-- payment_recommendations policies
ALTER TABLE public.payment_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations" ON public.payment_recommendations
FOR SELECT USING (clerk_user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can insert own recommendations" ON public.payment_recommendations
FOR INSERT WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update own recommendations" ON public.payment_recommendations
FOR UPDATE USING (clerk_user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can delete own recommendations" ON public.payment_recommendations
FOR DELETE USING (clerk_user_id = (auth.jwt() ->> 'sub'));

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION public.calculate_debt_progress(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.detect_and_create_milestones(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calculate_payment_breakdown(uuid, numeric, date) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.process_payment_and_update_debt(uuid, numeric, date) TO anon, authenticated, service_role;

-- Grant permissions for new tables
GRANT ALL ON TABLE public.debt_milestones TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.payment_recommendations TO anon, authenticated, service_role;

-- Create trigger to automatically detect milestones when debt is updated
CREATE OR REPLACE FUNCTION public.trigger_milestone_detection()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only trigger milestone detection if balance changed
    IF OLD.balance IS DISTINCT FROM NEW.balance THEN
        PERFORM public.detect_and_create_milestones(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER debt_milestone_detection_trigger
    AFTER UPDATE ON public.debts
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_milestone_detection();

-- Create initial milestones for existing debts
INSERT INTO public.debt_milestones (debt_id, milestone_type, milestone_value, description, achieved_date)
SELECT 
    id,
    'created',
    original_balance,
    'Debt created and tracking started',
    created_at
FROM public.debts
ON CONFLICT (debt_id, milestone_type) DO NOTHING;

-- Add first_payment milestones for debts that have payments
INSERT INTO public.debt_milestones (debt_id, milestone_type, milestone_value, description, achieved_date)
SELECT DISTINCT
    p.debt_id,
    'first_payment',
    d.balance,
    'First payment made',
    MIN(p.payment_date)::timestamp with time zone
FROM public.payments p
JOIN public.debts d ON p.debt_id = d.id
GROUP BY p.debt_id, d.balance
ON CONFLICT (debt_id, milestone_type) DO NOTHING;
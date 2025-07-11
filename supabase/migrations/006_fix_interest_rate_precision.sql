-- Fix interest_rate column to allow higher values
-- Change from DECIMAL(5,4) to DECIMAL(6,4) to allow values up to 99.9999%

ALTER TABLE debts 
DROP CONSTRAINT debts_interest_rate_check;

ALTER TABLE debts 
ALTER COLUMN interest_rate TYPE DECIMAL(6,4);

ALTER TABLE debts 
ADD CONSTRAINT debts_interest_rate_check 
CHECK (interest_rate >= 0 AND interest_rate <= 100);
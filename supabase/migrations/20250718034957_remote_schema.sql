

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_current_user_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT id FROM users
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  );
END;
$$;


ALTER FUNCTION "public"."get_current_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."debts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "balance" numeric(12,2) NOT NULL,
    "interest_rate" numeric(6,4) NOT NULL,
    "minimum_payment" numeric(10,2) NOT NULL,
    "due_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "clerk_user_id" "text" DEFAULT ''::"text" NOT NULL,
    "original_balance" numeric(10,2) DEFAULT 0 NOT NULL,
    CONSTRAINT "debts_balance_check" CHECK (("balance" >= (0)::numeric)),
    CONSTRAINT "debts_interest_rate_check" CHECK ((("interest_rate" >= (0)::numeric) AND ("interest_rate" <= (100)::numeric))),
    CONSTRAINT "debts_minimum_payment_check" CHECK (("minimum_payment" >= (0)::numeric)),
    CONSTRAINT "debts_type_check" CHECK (("type" = ANY (ARRAY['credit_card'::"text", 'loan'::"text", 'mortgage'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."debts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_plans" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "strategy" "text" NOT NULL,
    "monthly_budget" numeric(10,2) NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "clerk_user_id" "text" DEFAULT ''::"text" NOT NULL,
    "name" "text" DEFAULT 'Payment Plan'::"text" NOT NULL,
    "extra_payment" numeric(10,2) DEFAULT 0 NOT NULL,
    "target_date" "date",
    CONSTRAINT "payment_plans_extra_payment_check" CHECK (("extra_payment" >= (0)::numeric)),
    CONSTRAINT "payment_plans_monthly_budget_check" CHECK (("monthly_budget" > (0)::numeric)),
    CONSTRAINT "payment_plans_strategy_check" CHECK (("strategy" = ANY (ARRAY['avalanche'::"text", 'snowball'::"text", 'custom'::"text"])))
);


ALTER TABLE "public"."payment_plans" OWNER TO "postgres";


COMMENT ON COLUMN "public"."payment_plans"."is_active" IS 'Whether this payment plan is currently active';



COMMENT ON COLUMN "public"."payment_plans"."name" IS 'User-defined name for the payment plan';



COMMENT ON COLUMN "public"."payment_plans"."extra_payment" IS 'Additional payment amount beyond minimum payments';



COMMENT ON COLUMN "public"."payment_plans"."target_date" IS 'Target date for debt payoff (optional)';



CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "debt_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "payment_date" "date" NOT NULL,
    "type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "payments_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "payments_type_check" CHECK (("type" = ANY (ARRAY['minimum'::"text", 'extra'::"text", 'full'::"text"])))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


COMMENT ON COLUMN "public"."payments"."debt_id" IS 'Foreign key to debts table - every payment must belong to a debt';



ALTER TABLE ONLY "public"."debts"
    ADD CONSTRAINT "debts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_plans"
    ADD CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_active_payment_plans" ON "public"."payment_plans" USING "btree" ("clerk_user_id", "is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_debts_balance" ON "public"."debts" USING "btree" ("balance");



CREATE INDEX "idx_debts_clerk_user_id" ON "public"."debts" USING "btree" ("clerk_user_id");



CREATE INDEX "idx_debts_due_date" ON "public"."debts" USING "btree" ("due_date");



CREATE INDEX "idx_debts_interest_rate" ON "public"."debts" USING "btree" ("interest_rate");



CREATE INDEX "idx_debts_type" ON "public"."debts" USING "btree" ("type");



CREATE INDEX "idx_payment_plans_clerk_user_id" ON "public"."payment_plans" USING "btree" ("clerk_user_id");



CREATE INDEX "idx_payment_plans_is_active" ON "public"."payment_plans" USING "btree" ("is_active");



CREATE INDEX "idx_payment_plans_strategy" ON "public"."payment_plans" USING "btree" ("strategy");



CREATE INDEX "idx_payments_debt_date" ON "public"."payments" USING "btree" ("debt_id", "payment_date" DESC);



CREATE INDEX "idx_payments_debt_id" ON "public"."payments" USING "btree" ("debt_id");



CREATE INDEX "idx_payments_payment_date" ON "public"."payments" USING "btree" ("payment_date");



CREATE INDEX "idx_payments_type" ON "public"."payments" USING "btree" ("type");



CREATE OR REPLACE TRIGGER "update_debts_updated_at" BEFORE UPDATE ON "public"."debts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_payment_plans_updated_at" BEFORE UPDATE ON "public"."payment_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "public"."debts"("id") ON DELETE CASCADE;



CREATE POLICY "Users can delete own debts" ON "public"."debts" FOR DELETE USING (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can delete own payment plans" ON "public"."payment_plans" FOR DELETE USING (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can delete own payments" ON "public"."payments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."debts"
  WHERE (("debts"."id" = "payments"."debt_id") AND ("debts"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text"))))));



CREATE POLICY "Users can insert own debts" ON "public"."debts" FOR INSERT WITH CHECK (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can insert own payment plans" ON "public"."payment_plans" FOR INSERT WITH CHECK (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can insert own payments" ON "public"."payments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."debts"
  WHERE (("debts"."id" = "payments"."debt_id") AND ("debts"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text"))))));



CREATE POLICY "Users can update own debts" ON "public"."debts" FOR UPDATE USING (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can update own payment plans" ON "public"."payment_plans" FOR UPDATE USING (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can update own payments" ON "public"."payments" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."debts"
  WHERE (("debts"."id" = "payments"."debt_id") AND ("debts"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text"))))));



CREATE POLICY "Users can view own debts" ON "public"."debts" FOR SELECT USING (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can view own payment plans" ON "public"."payment_plans" FOR SELECT USING (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can view own payments" ON "public"."payments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."debts"
  WHERE (("debts"."id" = "payments"."debt_id") AND ("debts"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text"))))));



ALTER TABLE "public"."debts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_current_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."debts" TO "anon";
GRANT ALL ON TABLE "public"."debts" TO "authenticated";
GRANT ALL ON TABLE "public"."debts" TO "service_role";



GRANT ALL ON TABLE "public"."payment_plans" TO "anon";
GRANT ALL ON TABLE "public"."payment_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_plans" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;

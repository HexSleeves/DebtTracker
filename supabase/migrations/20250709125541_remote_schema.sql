alter table "public"."payment_plans" drop constraint "payment_plans_extra_payment_check";

drop index if exists "public"."idx_active_payment_plans";

drop index if exists "public"."idx_payment_plans_active";

alter table "public"."payment_plans" drop column "extra_payment";

alter table "public"."payment_plans" drop column "is_active";

alter table "public"."payment_plans" drop column "name";

alter table "public"."payment_plans" drop column "target_date";

alter table "public"."payment_plans" add column "active" boolean default true;

CREATE INDEX idx_active_payment_plans ON public.payment_plans USING btree (clerk_user_id, active) WHERE (active = true);

CREATE INDEX idx_payment_plans_active ON public.payment_plans USING btree (active);



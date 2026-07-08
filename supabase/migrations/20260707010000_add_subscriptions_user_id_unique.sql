-- Fix: apps/web/app/api/webhook/route.ts uses
--   .upsert(..., { onConflict: "user_id" })
-- to create a subscriptions row for new customers (checkout.session.completed /
-- customer.subscription.created/updated with no pre-existing row keyed by
-- stripe_customer_id). Postgres requires a real unique/exclusion constraint
-- matching the onConflict columns for this to work — without one, the upsert
-- fails silently at the DB level (Supabase-js doesn't throw; the webhook code
-- doesn't check the returned error), so new-customer subscriptions were never
-- persisted. Confirmed via live test-mode webhook replay during this rebuild:
-- a real customer.subscription.created event returned 200 but left the
-- subscriptions row untouched (still tier=free/status=inactive).
--
-- No duplicate user_id rows existed at migration time (verified via
-- `select user_id, count(*) from public.subscriptions group by user_id having count(*) > 1`
-- returning zero rows), so this constraint is safe to add directly.

alter table public.subscriptions
  add constraint subscriptions_user_id_key unique (user_id);

-- Verification query (run manually after applying):
--   select conname from pg_constraint where conrelid = 'public.subscriptions'::regclass and contype = 'u';
-- Expected: includes subscriptions_user_id_key.

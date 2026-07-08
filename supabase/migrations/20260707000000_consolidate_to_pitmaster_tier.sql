-- Consolidate subscription tiers to free + pitmaster only.
--
-- Findings from live schema verification (2026-07-07):
-- - subscriptions.tier is plain `text` with no CHECK constraint; the `subscription_tier`
--   Postgres enum ('free','backyard','pitmaster') exists but is NOT bound to any column
--   (confirmed via information_schema.columns), so it is not actually enforced anywhere.
--   Per REBUILD_PLAN.md §4, we only alter the enum if it's confirmed enforced — it isn't,
--   so this migration leaves the enum type alone (dead schema, candidate for a separate
--   later cleanup migration alongside the other unused stripe_* legacy tables).
-- - Live data at time of writing: 0 rows with tier IN ('basic','backyard'). This UPDATE
--   is a no-op today but is included so any stale/basic/backyard rows (test data, future
--   restores) are safely reset rather than left inconsistent with the new two-tier model.

update public.subscriptions
set tier = 'free',
    updated_at = now()
where tier in ('basic', 'backyard');

-- Verification query (run manually after applying):
--   select tier, status, count(*) from public.subscriptions group by tier, status;
-- Expected: no rows with tier in ('basic','backyard').

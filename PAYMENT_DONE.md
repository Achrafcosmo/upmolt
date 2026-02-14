# Payment System & Subscription Model — DONE

## DB Migrations (all executed)
- `um_subscriptions` table created with RLS
- `um_payments` table created with RLS
- `um_tasks` — added `payment_status`, `payment_id`, `price_usd`, `saved_usd` columns
- `um_agents` — added `subscription_plans` jsonb column

## Files Created
- `src/lib/payment.ts` — SOL price, USD→SOL conversion, payment verification
- `src/app/api/payments/create/route.ts` — Create payment record
- `src/app/api/payments/verify/route.ts` — Verify Solana tx + update statuses
- `src/app/api/payments/sol-price/route.ts` — Cached SOL price endpoint
- `src/app/api/subscriptions/create/route.ts` — Create subscription + payment
- `src/app/api/subscriptions/list/route.ts` — List user's active subscriptions
- `src/app/api/subscriptions/[id]/cancel/route.ts` — Cancel subscription
- `src/app/api/subscriptions/check/route.ts` — Check subscription status for agent
- `src/app/api/tasks/use-subscription/route.ts` — Use subscription task quota
- `src/components/PaymentModal.tsx` — Solana wallet payment UI
- `src/components/SubscriptionModal.tsx` — 3-tier subscription selection UI

## Files Modified
- `src/lib/supabase.ts` — Added Subscription, Payment types + subscription_plans to Agent
- `src/components/HireModal.tsx` — Subscription awareness, skip payment when using sub
- `src/app/agents/[slug]/page.tsx` — Subscribe tab, subscription status in sidebar
- `src/app/dashboard/page.tsx` — Subscriptions section, monthly spend card, cancel option

## NPM Packages Installed
- `@solana/web3.js`, `bs58`, `bignumber.js`

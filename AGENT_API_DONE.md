# Agent API — Complete

## What was built

### DB Schema
- Added columns to `um_agents`: `agent_api_key`, `agent_api_key_hash`, `claim_token`, `claimed`, `is_autonomous`, `last_seen_at`, `karma`, `gigs_completed`

### Files Created
- `src/lib/agent-auth.ts` — API key generation, hashing, verification
- `src/app/api/agent/register/route.ts` — POST register (no auth)
- `src/app/api/agent/me/route.ts` — GET profile
- `src/app/api/agent/gigs/route.ts` — GET browse gigs
- `src/app/api/agent/gigs/[id]/route.ts` — GET gig detail
- `src/app/api/agent/gigs/[id]/apply/route.ts` — POST apply
- `src/app/api/agent/gigs/[id]/submit/route.ts` — POST submit deliverable
- `src/app/api/agent/gigs/[id]/comments/route.ts` — GET/POST comments
- `src/app/api/agent/gigs/mine/route.ts` — GET my gigs
- `src/app/api/agent/claim/route.ts` — POST claim agent (user auth)
- `src/app/api/agent/claim/info/route.ts` — GET claim info
- `src/app/claim/[token]/page.tsx` — Claim page UI
- `public/skill.md` — Agent-readable skill file

### Files Modified
- `src/app/docs/page.tsx` — Added Agent API section with full curl examples and pro tips

## Ready for build & push

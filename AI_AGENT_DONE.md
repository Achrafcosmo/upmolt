# AI Agent Configuration — DONE

## What was added

### DB Schema
- Added columns to `um_agents`: `ai_config`, `api_key_encrypted`, `model`, `system_prompt`, `knowledge_base`, `output_format`, `max_tokens`, `temperature`

### New Files
- `src/lib/encryption.ts` — AES-256-GCM encryption for API keys
- `src/lib/ai-agent.ts` — AI agent runner (OpenAI + Anthropic)
- `src/app/creator/agents/[id]/edit/page.tsx` — Agent edit page

### Updated Files
- `src/app/creator/agents/new/page.tsx` — Added AI configuration section (model, API key, system prompt, knowledge base, output format, temperature, max tokens)
- `src/app/api/creator/agents/route.ts` — POST accepts AI config, encrypts API key; GET strips api_key_encrypted
- `src/app/api/creator/agents/[id]/route.ts` — Added GET + updated PUT with AI config fields
- `src/app/api/tasks/process/route.ts` — Real AI processing when agent has API key, fallback to simulation otherwise
- `src/app/agents/[slug]/page.tsx` — AI trust badges (Powered by, Custom trained, Knowledge base)

### Deployed
- Build: ✅ passing
- Live: https://upmolt.vercel.app

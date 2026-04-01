# Green Loop (RecycleHub) — Web App

Green Loop is a multi-role recycling platform UI built with React + TypeScript. It includes role-based dashboards (Recycler / Picker / Buyer), maps + heatmaps, community challenges, a wallet/market experience, and an AI recycling assistant powered by a Supabase Edge Function.

## Tech stack

- React 18 + TypeScript
- Vite (dev server runs on port **8080**)
- Tailwind CSS + shadcn-ui (Radix UI)
- React Router v6
- TanStack Query
- Supabase (Auth, DB, Edge Functions)
- Leaflet + react-leaflet + leaflet.heat
- Vitest + Testing Library

## Getting started

### Prerequisites

- Node.js (recommended: 18+)
- npm

### Install

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root (same folder as `package.json`):

```bash
VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon key>"
VITE_SUPABASE_PROJECT_ID="<project-ref>"
```

Important:
- **Do not commit** `.env` to git. Keep secrets out of the repository.
- The app reads these via `import.meta.env.*` in `src/integrations/supabase/client.ts`.

### Run the app

```bash
npm run dev
```

Then open `http://localhost:8080`.

## Supabase Edge Function (AI assistant)

The chatbot UI calls the edge function named `recycling-chat`:

- Function code: `supabase/functions/recycling-chat/index.ts`
- Invoked from: `src/components/AIChatBot.tsx` and `src/components/RecycleChatbot.tsx`

The edge function requires a server-side secret:

- `LOVABLE_API_KEY` (configured in Supabase Function secrets)

If the key is missing, the chatbot will return an error.

## Key routes

- **Public**
  - `/` (landing)
  - `/role-select`
  - `/auth/login?role=recycler|picker|buyer`
  - `/auth/signup?role=recycler|picker|buyer`

- **Recycler**
  - `/recycler/dashboard`
  - `/recycler/booking`
  - `/recycler/rewards`
  - `/recycler/leaderboard`
  - `/recycler/challenges`
  - `/recycler/impact`
  - `/recycler/wallet`
  - `/recycler/referral`
  - `/recycler/profile`

- **Picker**
  - `/picker/dashboard`

- **Buyer**
  - `/buyer/dashboard`
  - `/buyer/listings`
  - `/buyer/orders`
  - `/buyer/suppliers`
  - `/buyer/analytics`
  - `/buyer/messages`
  - `/buyer/payments`
  - `/buyer/carbon-market`

## Project structure (high level)

- `src/pages/` — route pages (auth, recycler, picker, buyer)
- `src/components/` — UI components + layouts + chatbot
- `src/components/ui/` — shadcn UI components
- `src/hooks/` — state + simulation hooks (notably `useRecycleHub`)
- `src/context/` — app contexts (`EcoContext`, `DialogContext`)
- `src/integrations/supabase/` — Supabase client + generated types
- `supabase/functions/` — edge functions (Deno)

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — eslint
- `npm run test` — vitest run
- `npm run test:watch` — vitest watch mode

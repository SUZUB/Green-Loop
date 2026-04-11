# GREEN LOOP

GREEN LOOP is a platform that turns plastic waste into a circular economy. Households schedule plastic pickups, verified collectors arrive to collect and scan a QR code to confirm the handoff, and both parties earn credits instantly. Manufacturers can then source that verified recycled plastic through a built-in marketplace. The goal is to make recycling effortless, rewarding, and transparent for everyone in the chain.

---

## Who is it for?

**Recyclers (households)** — book a pickup, show your QR code to the picker, watch your wallet fill up.

**Pickers (collectors)** — browedits.

**Buyers (manufacturers)** — source verified recycled plastic through listings, track orders, trade carbon credits.

---

## What does it do?

- Real-time pickup scheduling with a 5-step booking wizard
- QR-verified pickup handshake — the picker scans the recycler's unique QR to atomically complete the transaction and credit both wallets
- Live map with heatmap showing plastic collection hotspots
- Credit wallet — `credits = weight_kg × 100`, updated instantly without a page refresh
- Ages and downloadable PDF certificates
- Community cleanup challenges with maps and participant tracking
- Carbon credit marketplace for buyers
- AI recycling assistant chatbot
- AI camera for plastic type identification (picker)
- Leaderboard, referral program, impact tracker (CO₂ saved, animals protected)
- Knowledge hub covering plastic types (PET, HDPE, LDPE, etc.)

## Tech Stack

React 18 · TypeScript · Vite 5 (SWC) · Tailwind CSS 3 · shadcn/ui · Radix UI · React Router v6 · TanStack Query v5 · Supabase (Auth · PostgreSQL · Realtime · Edge Functions) · Framer Motion · Leaflet · react-leaflet · leaflet.heat · qrcode.react · html5-qrcode · jsPDF · html2canvas · Vitest · Testing Library
- [Data Flow: The Pickup Handshake](#data-flow-the-pickup-handshake)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [State Management](#state-management)
- [Scripts](#scripts)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & run

```bash
npm install
npm run dev
```

Open `http://localhost:8080`.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key>"
VITE_SUPABASE_PROJECT_ID="<project-ref>"

# Optional — plastic vision API for the AI camera feature
# VITE_PLASTIC_VISION_URL="https://your-api.example.com/plastic-scan"
```

> Never commit `.env` to git. It is already in `.gitignore`.

---

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run migrations to create the tables in [Database Schema](#database-schema).
3. Enable **Realtime** on the `pickups` table.
4. Deploy the AI chatbot edge function:

```bash
supabase functions deploy recycling-chat
```

5. Add the function secret in the Supabase dashboard:

```
LOVABLE_API_KEY = <your-key>
```

The chatbot returns an error without this key — the rest of the app still works fine.

---

## Key Routes

### Public
| Path | Page |
|---|---|
| `/` | Landing page |
| `/role-select` | Choose your role |
| `/auth/login` | Login (`?role=recycler\|picker\|buyer`) |
| `/auth/signup` | Signup |

### Recycler
| Path | Page |
|---|---|
| `/recycler/dashboard` | Live map + challenges panel |
| `/recycler/booking` | Book a pickup |
| `/recycler/history` | Pickup history |
| `/recycler/profile` | Profile, QR code, settings |
| `/recycler/wallet` | Credit wallet |
| `/recycler/impact` | Environmental impact stats |
| `/recycler/leaderboard` | Community leaderboard |
| `/recycler/achievements` | Badges + PDF certificate |
| `/recycler/rewards` | Reward redemption |
| `/recycler/referral` | Referral program |
| `/recycler/challenges` | Cleanup challenges |

### Picker
| Path | Page |
|---|---|
| `/picker/dashboard` | Schedule, stats, earnings |
| `/picker/available-pickups` | Live pickup feed |
| `/picker/history` | Completed pickups |
| `/picker/profile` | Profile + QR scanner |

### Buyer
| Path | Page |
|---|---|
| `/buyer/dashboard` | Market overview |
| `/buyer/listings` | Plastic listings |
| `/buyer/orders` | Order tracker |
| `/buyer/supplier|
| `/buyer/analytics` | Market analytics |
| `/buyer/messages` | Messaging |
| `/buyer/payments` | Payment history |
| `/buyer/carbon-market` | Carbon credit trading |
| `/buyer/profile` | Buyer profile |

### Shared
| Path | Page |
|---|---|
| `/community` | Community hub |
| `/education/knowledge-hub` | Plastic type education |
| `/partners` | Partner organisations |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| B0** |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| Backend | Supabase (Auth, PostgreSQL, Realtime, Edge Functions) |
| Maps | Leaflet + react-leaflet + leaflet.heat |
| Animation | Framer Motion |
| QR | qrcode.react (display) + html5-qrcode (scan/upload) |
| PDF | jsPDF + html2canvas |
| AI chatbot | Supabase Edge Function (`recycling-chat`) |
| Testing | Vitest + Testing Library |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│  React App (Vite)                                       │
│  ├── EcoContext          — global impact counters       │
│  ├── RecycleHubProvider  — market, challenges, wallet   │
│  ├── usePickupSchedule   — offline-first pickup store   │
│  │     localStorage ←→ Supabase Realtime               │
│  └── Supabase client     — auth + DB + edge functions   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                     Supabase                            │
│  ├── Auth (email/password, role stored in profiles)     │
│  ├── PostgreSQL                                         │
│  │     profiles, pickups, pickup_transactions,          │
│  │     recycling_pickups, user_badges                   │
│  ├── Realtime (postgres_changes on pickups table)      │
│  └── Edge Functions                                     │
│        recycling-chat  — AI assistant (LOVABLE_API_KEY) │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow: The Pickup Handshake

```
Recycler books pickup
  → schedulePickup() writes to localStorage + Supabase pickups (AVAILABLE)
  → QRCodeDisplay renders QR: { type: "recycler_identity", recycler_id, pickup_id }

Picker accepts pickup
  → acceptPickup() sets status → ASSIGNED in localStorage + Supabase

Picker scans QR
  → QRScannerModal decodes payload
  → findActivePickupByRecycler() validates an active pickup exists
  → completeTransaction(pickupId, weight_kg, pickerId, pickerName)
      ├── marks pickup → "completed" in localStorage
      ├── addToRecyclerWallet(recyclerId, credits)    [localStorage]
      ├── addPickerTx(pickerId, transaction)           [localStorage]
      ├── notifyCompletion(CompletionEvent)            [in-process event bus]
      │     ├── usMetrics
      │     ├── RecyclerProfile: switches tab QR → History automatically
      │     └── PickerDashboard: increments session counters live
      └── Supabase profile update (total_recycled_kg, coin_balance, total_pickups)

Credit formula:  credits = Math.round(weight_kg × 100)
```

---

## Database Schema

| Table | Purpose |
|---|---|

| `pickups` | Live pickup requests. Status: `AVAILABLE → ASSIGNED → COMPLETED`. Has `verification_token` for QR-based verification |
| `pickup_transactions` | Immutable record of each completed handoff: `picker_id`, `recycler_id`, `weight_kg`, `points_earned` |
| `recycling_pickups` | Per-user pickup history used by the recycler profile |
| `user_badges` | Earned achievement badges per user |

**RPC functions:**

| Function | Purpose |
|---|---|
| `accept_pickup(p_pickup_id)` | Atomically assigns a picker |
| `complete_pickup(p_pickup_id)` | Marks a pickup completed |
| `generate_pickup_token(p_pickup_id)` | Creates a verification token |
| `verify_pickup_token(p_token)` | Validates a token-based QR scan |
| `complete_pickup_transaction(p_picker_id, p_recycler_id, p_weight_kg)` | Full atomic handshake |

---

## Project Structure

```
src/
├── assets/               # Background images (hero, vision)
├── components/
│   ├── ui/               # shadcn/ui primitives (50+ components)
, SourcingForm
│   ├── challenges/       # ChallengeCard, ChallengeDetails, ChallengeList
│   ├── landing/          # FutureVision (plastic roads, bricks, RVM sections)
│   ├── picker/           # QRScannerModal
│   ├── recycler/         # QRCodeDisplay, PickerMapTracker, CertificateModal
│   ├── AIChatBot.tsx     # Floating AI assistant
│   ├── Layout.tsx        # Shell for picker/buyer routes
│   ├── RecyclerLayout.tsx# Recycler shell with collapsible sidebar
│   ├── RecyclerSidebar.tsx
x       # Picker/buyer sidebar
│   └── PageBackground.tsx# Parallax photo backgrounds with overlay
├── context/
│   ├── EcoContext.tsx    # Global impact counters + user profile
│   └── DialogContext.tsx
├── data/
│   └── mockData.ts       # Leaderboard seed data
├── hooks/
│   ├── usePickupSchedule.ts   # Core offline-first pickup store + event bus
│   ├── useRecycleHub.tsx      # Market, challenges, wallet, metrics (Context)
│   ├── useAvailablePickups.ts # Supabase live pickup feed
│   ├── usePickupBroadcast.ts  # Broadcasts new pickups to Supabase
│   ├── usePickerGeolocation.ts# Broadcasts picker GPS every 10s
│   ├── useHeatmapData.ts      # Heatmap points for Leaflet
│   ├── useUserStats.ts        # Recycler stats + badge evaluation
│   ├── useCountUp.ts          # Animated number counter
│   └── useTimeSimulation.ts   # Time-based simulation for demos
├── integrations/
│   └── supabase/
│       ├── client.ts     # createClient with env vars
│       └── types.ts      # Auto-generated DB types
├── lib/
│   ├── utils.ts          # cn() helper
│   └── plasticScan/
│       └── analysis.ts   # Plastic scan API types + analysis logic
├── pages/
│   ├── Index.tsx         # Landing page
│   ├── RoleSelect.tsx
│   ├── auth/             # Login, Signup
│   ├── recycler/         # Dashboard, Booking, History, Profile, Wallet,
│   │                     # Impact, Leaderboard, Achievements, Rewards, Referral
│   ├── picker/           # Dashboard, AvailablePickups, History, Profile, AICamera
│   ├── buyer/            # Dashboard, Listings, Orders, Suppliers, Analytics,
│   │                     # Messages, Payments, CarbonMarket, Profile
│   ├── community/
│   ├── education/
│   └── partners/
├── utils/
│   └── generateInvoice.ts# PDF invoice generation
├── App.tsx               # Provider tree + route definitions
├── main.tsx              # React root + AppErrorBoundary
└── index.css             # Tailwind directives + CSS variables + glassmorphism
```

---

## State Management

Three layers, each with a different scope:

**`usePickupSchedule`** — the core offline-first singleton. Pickups and picker transactions live in `localStorage` and sync to Supabase Realtime. A module-level event bus (`_completionListeners`) lets any component react to a completed pickup without polling or prop drilling.

**`RecycleHubProvider`** — React Contextcompletion event bus to update wallet and impact stats in real time.

**`EcoContext`** — lightweight global context for landing page counters (`globalPlasticCollected`, `globalCO2Saved`, `globalUsersActive`) and the current user's role.

---

## Scripts

```bash
npm run dev          # Vite dev server (port 8080)
npm run build        # Production build
npm run build:dev    # Development build (unminified)
npm run preview      # Preview production build locally
npm run lint         # ESLint
npm run test         # Vitest single run
npm run test:watch   # Vitest watch mode
```

# Vault — Frontend

Production-grade Next.js 15 frontend for the [Vault API](https://github.com/Antonynans/Vault-api) — a multi-currency fintech platform.

## Tech Stack

| Layer        | Technology                                    |
|--------------|-----------------------------------------------|
| Framework    | Next.js 15 (App Router) + TypeScript          |
| Styling      | Tailwind CSS + custom CSS design system       |
| Animation    | Framer Motion                                 |
| Charts       | Recharts                                      |
| State        | Zustand (auth) + React local state            |
| HTTP         | Axios with JWT refresh interceptor            |
| Fonts        | DM Serif Display · Syne · IBM Plex Mono       |

## Design System

- **Palette:** Deep navy (`#080a0e`) base · Gold (`#d4af37`) accent · Green/Red/Blue semantic
- **Typography:** DM Serif Display (headings) · Syne (UI) · IBM Plex Mono (numbers/code)
- **Components:** Glass cards, gold CTA buttons, animated sidebars, toast notifications, data tables

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Authentication with branded split-screen layout |
| `/register` | Account creation with password strength meter |
| `/dashboard` | Overview — stats, cash flow chart, account cards, recent transactions |
| `/accounts` | All accounts with freeze/unfreeze, wallet limit table |
| `/transactions` | Full paginated transaction history with filters + CSV export |
| `/kyc` | KYC submission form, status tracking, tier breakdown |
| `/notifications` | In-app notification centre with read/unread state |
| `/settings` | Profile, Transaction PIN management, Security status |
| `/admin` | Platform stats, user growth chart, volume chart |
| `/admin/users` | User management — search, paginate, deactivate |
| `/admin/kyc` | KYC review queue — approve or reject with notes |

## Quick Start

```bash
# 1. Start the Vault API (NestJS backend)
cd Vault-api
docker compose up --build

# 2. Install & run the frontend
cd vault-frontend
npm install
cp .env.example .env.local   # edit if needed
npm run dev
# → http://localhost:3001
```

## Project Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── dashboard/page.tsx
│   ├── accounts/page.tsx
│   ├── transactions/page.tsx
│   ├── kyc/page.tsx
│   ├── notifications/page.tsx
│   ├── settings/page.tsx
│   └── admin/
│       ├── page.tsx
│       ├── users/page.tsx
│       └── kyc/page.tsx
├── layout.tsx
├── page.tsx              ← redirects to /login
├── not-found.tsx
└── globals.css           ← full design system
components/
├── layout/
│   ├── AppShell.tsx      ← auth guard + layout wrapper
│   ├── Sidebar.tsx       ← responsive sidebar with mobile drawer
│   └── Topbar.tsx
├── dashboard/
│   ├── StatCard.tsx
│   ├── AccountCard.tsx
│   └── TransactionRow.tsx
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    ├── Select.tsx
    ├── Modal.tsx
    ├── Badge.tsx
    ├── Spinner.tsx
    └── Toast.tsx
lib/
├── api.ts                ← full Axios client, all endpoints
├── types.ts              ← all TypeScript interfaces
└── utils.ts              ← formatCurrency, formatDate, etc.
store/
└── auth.ts               ← Zustand auth store
```

## Key Engineering Decisions

- **JWT refresh** — Axios interceptor queues in-flight requests during token refresh, no lost calls
- **AppShell guard** — checks localStorage token on mount, calls `/users/me`, redirects if invalid
- **kobo-aware currency** — all amounts stored as integers (kobo/cents), formatted via `formatCurrency(amount, currency)`
- **Idempotency** — transfer modal generates a UUID key, passed as `Idempotency-Key` header
- **Admin access** — admin nav links render conditionally based on `user.role === "admin"` from Zustand
# Vault-frontend

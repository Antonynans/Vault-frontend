# Vault — Frontend

Production-grade Next.js 15 frontend for the [Vault API](https://github.com/Antonynans/Vault-api) — a multi-currency fintech platform.
---
## 🌍 Live Demo

- **Frontend App:**  
  👉 https://vault-app1.netlify.app/

- **API Docs (Swagger):**  
  👉 https://vault-api-sbav.onrender.com/api/docs

## Tech Stack

| Layer     | Technology                              |
| --------- | --------------------------------------- |
| Framework | Next.js 15 (App Router) + TypeScript    |
| Styling   | Tailwind CSS + custom CSS design system |
| Animation | Framer Motion                           |
| Charts    | Recharts                                |
| State     | Zustand (auth) + React local state      |
| HTTP      | Axios with JWT refresh interceptor      |
| Fonts     | DM Serif Display · Syne · IBM Plex Mono |

## Features

- Authentication: user login, registration, and session management
- Dashboard: consolidated account overview, transaction history, and analytics
- Accounts: multi-currency account listing and balance display
- Transactions: transfer, deposit, and transaction tracking workflows
- Admin section: user management, KYC review, and admin-only dashboards
- Settings: profile updates, security controls, and preference management
- Notifications: in-app alerts and status updates
- Responsive UI: mobile-first design with modern animations and accessibility considerations

## Quick Start

```bash
# 1. Start the Vault API (NestJS backend)
cd Vault-api
docker compose up --build

# 2. Install & run the frontend
cd vault-frontend
npm install
cp .env.example .env.local
npm run dev
# → http://localhost:3000
```

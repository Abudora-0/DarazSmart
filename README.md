<div align="center">

# 🛒 DarazSmart

**Shop Daraz.pk smarter.** Compare prices, track drops, collect coupons, and manage a virtual cart — all powered by live Daraz data.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Live Demo](https://darazsmart.vercel.app) · [Report an Issue](../../issues)

</div>

---

> **Disclaimer:** DarazSmart is an independent, unofficial price-comparison tool. It is **not affiliated with, endorsed by, or sponsored by Daraz.pk**. All product data, prices, and trademarks belong to their respective owners; purchases are completed on Daraz.

## ✨ Features

| | |
|---|---|
| 🔎 **Live product search** | Powered by Daraz's own JSON catalog API — fast, no headless browser required |
| 🧠 **Smart relevance filtering** | Scores results against your query so off-topic backfill items get filtered out |
| 🎚️ **Rich filter sidebar** | Price range with histogram, star rating, brand, sort, and an "on sale" toggle. Becomes a bottom sheet on mobile |
| 🛒 **Virtual cart** | Quantities, a live savings summary, and an optional sync to your account |
| 🏷️ **Coupon collector** | Browse and one-click-copy active voucher codes |
| 📈 **Price history & alerts** | Track price movement over time and get emailed the moment a target price hits |
| ❤️ **Wishlist** | Save products for later, kept separate from the cart |
| ⚖️ **Side-by-side compare** | Pin up to four products and compare price, discount, rating and seller |
| ⌨️ **Command palette** | `Ctrl`/`Cmd` + `K` for search, categories, pages and settings |
| 🌗 **Light and dark themes** | Follows your system by default, with no flash of the wrong theme on load |
| 🔗 **Shareable filters** | Every filter lives in the URL, so a filtered result set can be sent to someone |
| 🕑 **Recently viewed & trending** | A home page that actually feels alive, not just a search box |
| 🔐 **Secure auth** | Email/password with validation, rate limiting, and bcrypt hashing |
| ⚡ **Fast & polished** | Skeleton loaders, toast feedback, scroll-reveal animations, load-more pagination |

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, webpack) + [React 19](https://react.dev/) |
| Language | TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) with a semantic token layer, plus [Radix](https://www.radix-ui.com/) primitives |
| Database | [PostgreSQL](https://www.postgresql.org/) via [Neon](https://neon.tech/) + [Prisma 7](https://www.prisma.io/) |
| Cache | [Upstash Redis](https://upstash.com/) |
| Auth | [NextAuth v5](https://authjs.dev/) (Credentials provider) |
| Email | [Resend](https://resend.com/) |
| Client state | [Zustand](https://zustand-demo.pmnd.rs/) (localStorage-persisted cart, wishlist and compare) |
| Charts | [Recharts](https://recharts.org/) |
| Deployment | [Vercel](https://vercel.com/) (fully serverless — no headless browser) |

## 🚀 Getting Started

### Prerequisites

Free accounts at [Neon](https://neon.tech) (database), [Upstash](https://upstash.com) (Redis), and [Resend](https://resend.com) (email).

### Setup

```bash
# 1. Clone and install
git clone https://github.com/Abudora-0/darazsmart.git
cd darazsmart
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in your values

# 3. Create the database schema
npx prisma migrate dev --name init

# 4. (Optional) seed a few starter coupons
npm run db:seed

# 5. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

See [`.env.example`](.env.example) for the exact environment variables required.

## ☁️ Deploying to Vercel

DarazSmart is **fully serverless-ready** — all Daraz data fetching goes through `fetch` against Daraz's public JSON catalog endpoint, so no headless browser is ever needed in production.

1. Push to GitHub and import the repo in [Vercel](https://vercel.com/new).
2. Add every variable from `.env.example` under **Project → Settings → Environment Variables**.
3. Deploy — `prisma generate` runs automatically via the `postinstall` script.
4. Run the migration once against your production database: `npx prisma migrate deploy`.

Two daily cron jobs (`vercel.json`), protected by `CRON_SECRET`:
- **`refresh-prices`** — updates prices for products currently sitting in a cart
- **`check-alerts`** — emails users when their target price is hit

> Coupons are sourced from the database rather than live-scraped, since Daraz's voucher page has no public API — see `prisma/seed.ts`.

## 📁 Project Structure

```
src/
├── app/                    # routes — pages, API handlers, and cron jobs
├── components/             # shared UI components
├── lib/
│   ├── scraper/search.ts   # fetch-based Daraz search (no browser)
│   ├── search-service.ts   # search + relevance filtering + DB upsert
│   ├── product-service.ts  # product + price-history fetching
│   ├── db.ts                # Prisma client
│   ├── cache.ts              # Upstash Redis client
│   ├── auth.ts                # NextAuth configuration
│   └── toast.ts                # lightweight toast notifications
├── store/cart.ts           # Zustand cart store
└── generated/prisma/       # generated Prisma client (gitignored)

prisma/
├── schema.prisma           # database schema
└── seed.ts                 # starter coupon data
```

## 📄 License

Licensed under the [MIT License](LICENSE).

---

<div align="center">
<sub>Built with ❤️ for smarter shopping.</sub>
</div>

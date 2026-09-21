# ZMW Backend

Node.js + Express + Sequelize (MySQL) REST API for the ZMW Clothing store
and its admin panel.

## Stack

Express · Sequelize 6 · MySQL 8 (via `mysql2`) · JWT auth · bcrypt · Helmet ·
CORS · express-rate-limit · express-validator · Multer

## 1. Prerequisites

- Node.js 18+
- A running MySQL 8 server (or MariaDB 10.6+) you can create a database on

## 2. Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

- `DB_*` — point at your MySQL server and a database you've created
  (`CREATE DATABASE zmw_db CHARACTER SET utf8mb4;`), plus a user with
  privileges on it.
- `JWT_SECRET` — a long random string (`openssl rand -hex 64`). **Required** —
  the app refuses to start without one.
- `CORS_ORIGIN` — comma-separated URLs of the customer frontend and admin
  panel (e.g. `http://localhost:3000,http://localhost:5173`).
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — the first admin account.
  **Change the password and rotate it after first login.**

## 3. Database

```bash
npm run db:migrate   # creates all 13 tables
npm run db:seed      # seeds: 1 admin user, the real ZMW catalog
                      # (converted from the existing frontend's products.js —
                      # 6 categories, subcategories, 99 products with their
                      # images/colors/sizes), 11 homepage sections, and
                      # department/collection banners
```

Seeders are idempotent — re-running `db:seed` skips tables that already
have data instead of duplicating rows. To start over:

```bash
npm run db:reset      # undo all migrations, re-migrate, re-seed
```

## 4. Run

```bash
npm run dev     # nodemon, auto-restart
npm start       # plain node
```

The API listens on `PORT` (default `5000`). `GET /health` is an
unauthenticated liveness check.

## 5. API overview

All responses are `{ success: true, data, meta? }` or
`{ success: false, error: { code, message, details? } }`.

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/login` | — | rate-limited |
| GET | `/api/auth/me` | admin | |
| GET | `/api/categories` | — | `?includeInactive=true` for admin views |
| GET | `/api/categories/:slug` | — | |
| POST/PUT/DELETE | `/api/categories(/:id)` | admin | |
| GET | `/api/subcategories?category=:slug` | — | |
| POST/PUT/DELETE | `/api/subcategories(/:id)` | admin | |
| GET | `/api/products` | — | `category, type, collection, color, size, availability, minPrice, maxPrice, sort, page, limit` — mirrors the existing Collection.jsx filters |
| GET | `/api/products/:slug` | — | |
| POST/PUT/DELETE | `/api/products(/:id)` | admin | body accepts nested `images[]`, `colors[{name,hex}]`, `sizes[]` |
| PATCH | `/api/products/:id/best-seller` \| `/new-arrival` \| `/stock` | admin | |
| GET/POST/PUT/DELETE | `/api/products/:id/variants(/:variantId)` | admin | per size/color stock |
| GET | `/api/banners?placement=:key` | — | |
| POST/PUT/DELETE | `/api/banners(/:id)` | admin | |
| GET | `/api/home` | — | one call: active sections, categories+subcategories, banners by placement, best-sellers, new-arrivals |
| GET/PUT | `/api/home/admin/sections(/:key)` | admin | toggle/reorder/configure homepage sections |
| POST | `/api/orders` | — | guest checkout; validates & decrements stock transactionally |
| GET/GET | `/api/orders(/:id)` | admin | |
| PATCH | `/api/orders/:id/status` | admin | |
| POST | `/api/contact` | — | Contact Us form target |
| GET/GET/PATCH/DELETE | `/api/contact(/:id)` | admin | |
| POST | `/api/admin/uploads/:folder` | admin | `folder` ∈ `products, categories, banners`; multipart `files` field, up to 10 |
| GET | `/api/admin/dashboard/summary` | admin | counts for the admin dashboard landing page |

## 6. Notes on the seeded catalog

- The product `category` field is the department slug (`mens`, `women`,
  `kids`, `boys`, `girls`, `babies`) and `subCategory` is the finer type
  used for filter pills — this matches the shape `Collection.jsx` already
  expects from `UNIFIED_PRODUCTS`, so wiring the existing frontend to this
  API later should mean swapping a static import for a `fetch()` call, not
  a rewrite.
- Two pairs of products in the original `products.js` shared duplicate
  SKUs (`ZMW-WOM-PT-05`, `ZMW-WOM-PT-06`) — the seed script keeps all four
  products but appends a suffix to the SKU so the database's unique
  constraint holds. Worth a look if that's meant to be intentional.
- Seeded image URLs point at `/images/...` paths from the existing
  frontend's `public/images` folder (that's where the real photos already
  live). Anything uploaded through `/api/admin/uploads` afterwards is
  served from this backend at `/uploads/...` instead.
- `is_best_seller` is true for a large share of the seeded catalog (58 of
  99) because that's what the source data already had it set to — not a
  bug in the seeder.

## 7. Security notes

- Passwords are bcrypt-hashed; the hash is excluded from every `AdminUser`
  query by default (`defaultScope`).
- JWT auth middleware re-loads the admin from the database on every
  request (a deactivated account is rejected immediately, not just at
  next login).
- Login is rate-limited separately (and more tightly) than the rest of
  the API.
- Uploads validate MIME type + extension, cap file size (`UPLOAD_MAX_FILE_SIZE_MB`),
  write with randomized filenames, and the destination folder is checked
  against a fixed allow-list *before* touching the filesystem.
- Sequelize + parameterized queries throughout — no raw string-built SQL.
- `helmet`, `cors` (origin allow-list from `CORS_ORIGIN`), and a general
  rate limiter are applied globally.

## 8. What's intentionally not here yet

- The React admin panel (separate app, next phase).
- Wiring the existing customer frontend to these APIs (it still reads
  from the static `src/data/products.js`).
- A payment gateway integration — orders currently support COD/PREPAID as
  a field, with no payment processor wired up (matches the original
  frontend, which doesn't have one either).

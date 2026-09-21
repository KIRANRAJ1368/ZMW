# ZMW Admin Panel

React (Vite) + plain CSS admin panel for the ZMW backend.

## 1. Setup

```bash
cd admin
npm install
cp .env.example .env
```

Edit `.env` if your backend isn't running at the default `http://localhost:5000`.

## 2. Run

```bash
npm run dev
```

Opens on `http://localhost:5173` by default. Make sure the backend
(`../backend`) is running first, and that its `.env` `CORS_ORIGIN` includes
`http://localhost:5173`.

Sign in with the admin account you created when you ran `npm run db:seed`
in the backend (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).

## 3. Build for production

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally to check it
```

`VITE_API_URL` is baked into the build at build time — set it to your real
API URL before building for deployment.

## 4. What's here

| Page | Route | Does |
|---|---|---|
| Login | `/login` | Admin sign-in (JWT stored in `localStorage`) |
| Dashboard | `/` | Product/category/order/message counts, quick links |
| Products | `/products` | Filterable list, best-seller/new-arrival toggles, stock badge, delete |
| Product form | `/products/new`, `/products/:id/edit` | Full editor: pricing, stock, badges, images (URL or upload), colors, sizes |
| Categories | `/categories` | CRUD |
| Subcategories | `/subcategories` | CRUD, filterable by category |
| Banners | `/banners` | CRUD for hero/department/collection banners, with image upload |
| Homepage Sections | `/homepage-sections` | Toggle visibility, reorder, edit title/subtitle per section |
| Orders | `/orders` | Filterable list, detail view, status update |
| Contact Submissions | `/contact` | List, read, status update, delete, "reply by email" (`mailto:`) |

Every list has a loading state, an empty state, and (for anything
destructive) a confirmation dialog. Every form surfaces the backend's
field-level validation errors inline.

## 5. Architecture notes

- `src/services/api.js` — one fetch wrapper: attaches the JWT, normalizes
  errors into `ApiError` (with `.status`, `.code`, `.details`), and clears
  the stored token on a 401.
- `src/services/resources.js` — one function per backend endpoint, so
  pages never hardcode a URL path.
- `src/context/AuthContext.jsx` — holds the logged-in admin, re-validates
  the stored token against `/api/auth/me` on load.
- `src/context/ToastContext.jsx` — `useToast().success(...)` /
  `.error(...)` for feedback after any action.
- `src/components/` — the shared primitives every page is built from:
  `DataTable` (loading/empty states built in), `Modal`, `ConfirmDialog`
  (`useConfirm()` hook — `await confirm({ title, message })`),
  `Pagination`, `StatusBadge`, `FormField`.
- Product create/edit sends nested `images[]` / `colors[{name,hex}]` /
  `sizes[]` arrays in one request — the backend replaces the product's
  full set of each on every save (see `productService.replaceNestedCollections`
  in the backend).

## 6. Not included yet

- Wiring the *customer* storefront to the backend APIs (separate,
  still-pending piece of work).
- Bulk actions (bulk delete/activate) — everything here is single-row.
- Rich-text editing for product descriptions (plain textarea for now).

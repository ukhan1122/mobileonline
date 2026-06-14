# WhatMobile.pk Clone — Next.js 15/16 + MongoDB Atlas

A modern clone of WhatMobile.com.pk — the leading mobile phone price listing site in Pakistan.

Built with:
- **Next.js 16** (App Router)
- **MongoDB Atlas** + Mongoose
- TypeScript
- Tailwind CSS
- Beautiful, clean, mobile-first design

---

## Features Implemented

### Pages
- **Homepage** — Hero, price range quick links, popular brands, featured phones, trending section
- **Dynamic Price Ranges** — `/prices/under-20000`, `/prices/20000-40000`, `/prices/40000-80000`, `/prices/above-80000`
- **Individual Phone Page** — Full specs, variants, pricing — `/phones/[slug]`
- **Brand Pages** — `/brands/[slug]` + full brands index at `/brands`
- **Powerful Search** — `/search?q=samsung` with client + server filtering + sorting
- **API** — `/api/phones` (supports search, filters, sorting)

### Dynamic Search & Filtering
- Text search (name + brand)
- Price range filtering
- Brand filtering
- Multiple sort options

---

## Project Structure

```
app/
├── api/phones/route.ts           # Main phones API (search + filters)
├── brands/
│   ├── page.tsx                  # All brands listing
│   └── [slug]/page.tsx           # Brand-specific phones
├── phones/
│   └── [slug]/page.tsx           # Phone detail page (full specs)
├── prices/
│   └── [range]/page.tsx          # Dynamic price range pages
├── search/
│   └── page.tsx                  # Search + filter UI
├── layout.tsx
└── page.tsx                      # Homepage

components/
├── Header.tsx
├── Footer.tsx
├── PhoneCard.tsx
├── PriceRangeCard.tsx
├── BrandCard.tsx
├── SearchBar.tsx
└── Toaster.tsx

lib/
├── mongodb.ts                    # Cached MongoDB connection
├── types.ts                      # TypeScript interfaces
└── utils.ts (add helpers here)

models/
└── Phone.ts                      # Mongoose schema + model

scripts/
└── seed.ts                       # Seed realistic sample data

.env.local.example
```

---

## Step-by-Step Setup

### 1. MongoDB Atlas Setup (Free Tier)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account.
2. Create a **new project** → name it "MobilePrices".
3. Click **"Build a Database"** → Choose **M0 Free** cluster.
4. Select a region close to Pakistan (e.g. AWS `ap-south-1` Mumbai or Singapore).
5. Create the cluster (takes ~1-2 minutes).
6. Once created, click **"Connect"**:
   - Choose **"Drivers"** → Driver = **Node.js** → Version = latest
   - Copy the connection string.
7. **Create a database user** (important):
   - Go to **Database Access** → Add New Database User
   - Choose password authentication
   - Give read/write privileges on the database
8. **Whitelist your IP**:
   - Go to **Network Access** → Add IP Address
   - For local development: click "Allow Access from Anywhere" (0.0.0.0/0) — **only for development**
9. Replace the connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mobileprices?retryWrites=true&w=majority
```

**Note:** Replace `<password>` (URL encode if it has special chars). The database name can be in the URI (we recommend `mobileprices`).

### 2. Local Setup

```bash
# 1. Clone / use this folder
cd mobileonline

# 2. Install dependencies (already done in this workspace)
npm install

# 3. Copy env
cp .env.local.example .env.local

# 4. Edit .env.local and paste your MONGODB_URI

# 5. Run the development server
npm run dev
```

### 3. Seed Sample Data

```bash
npm run seed
```

This will insert 8 realistic phones (Samsung, Apple, Xiaomi, Infinix, Realme, Vivo, Tecno) so you can immediately test the UI.

After seeding, visit:
- http://localhost:3000
- http://localhost:3000/search?q=samsung
- http://localhost:3000/prices/40000-80000
- http://localhost:3000/phones/samsung-galaxy-a35-5g

### 4. Add Your Own Phones

You have two options:

**A. Use the seed script** — Edit `scripts/seed.ts` and add more phones, then run `npm run seed`.

**B. Use MongoDB Atlas Data Explorer** or Compass:
- Insert documents matching the schema defined in `models/Phone.ts`.

---

## Troubleshooting: `querySrv ECONNREFUSED` / connection errors on POST /api/phones (or other DB pages)

You may see logs like:

```
POST /api/phones error: Error: querySrv ECONNREFUSED _mongodb._tcp.cluster0.liz89up.mongodb.net
```

**Root cause:** The Node.js MongoDB driver cannot perform the required DNS SRV/TXT lookup for your Atlas hostname. This is **not** usually a code bug.

**Most common fixes (in order):**

1. **Cluster is paused (very common on free tier)**
   - Log into https://cloud.mongodb.com
   - Find your cluster → click **Resume** if it says Paused/Suspended. Wait 1-2 minutes.

2. **Network Access / IP whitelist**
   - Atlas → **Network Access** tab → **Add IP Address** → choose "Allow Access from Anywhere" (`0.0.0.0/0`) for development.
   - (Or add your exact current public IP.)

3. **Bad / outdated connection string**
   - Atlas → **Connect** → **Drivers** → Node.js → copy the string again.
   - Paste the **entire** value after `MONGODB_URI=` in `.env.local`.
   - Make sure the password is URL-encoded if it has special characters (`@` → `%40`, etc.).

4. **Full dev server restart required**
   - After any `.env.local` change:
     ```powershell
     taskkill /F /IM node.exe
     npm run dev
     ```

5. **Local DNS / network blocks SRV records**
   - Try from another network (mobile hotspot) to test.
   - Some VPNs, corporate firewalls, or ISP DNS resolvers refuse SRV queries.
   - Workaround: In Atlas Connect screen you can also choose the **"mongodb://"** (non-srv) connection string. Replace your current one and restart.

6. **Cluster was deleted or credentials rotated**
   - Create a new cluster (or new database user) and update the URI.

After fixing, run `npm run seed` again and test adding a phone via `/add-phone`.

The app now surfaces much clearer guidance for this class of error (both on pages and in API responses).

---

## Database Schema (Phone)

Full schema is in `models/Phone.ts`.

Key fields:
- `name`, `brand`, `slug` (unique, URL-safe)
- `price` (lowest / starting), `priceMax`
- `specs`: nested object with `display`, `processor`, `camera`, `battery`, `os`, etc.
- `variants[]`: array of `{storage, ram, price}`
- `isFeatured`, `popularityScore`
- Text index on `name` + `brand` for search

---

## Current State & Next Steps

**Admin / Add Phones:**
- The "Add Phone" form is currently **development-only** (visible only when `NODE_ENV=development`).
- On production (Vercel, etc.) the button and page are hidden with a "Restricted Area" message.
- This provides basic protection without needing a full auth system for a personal project.

**Recommended Next Steps (if you want to extend):**

1. **Full Admin Panel** — Add password protection or NextAuth for a real `/admin` area.
2. **Price history** — Add a `PriceHistory` model + charts (use recharts or chart.js).
3. **Compare phones** — `/compare?ids=slug1,slug2`.
4. **Advanced filters** — RAM, storage, camera specs, etc.
5. **Sitemap + SEO** — Automatic sitemap for all phones and brands.
6. **Real price scraping** — Pull live prices from local retailers (Jazzy, PriceOye, etc.).
7. **User accounts / favorites** — Allow users to save phones.

---

## Useful Commands

```bash
npm run dev
npm run build
npm run seed
npm run lint
```

---

## Environment Variables

| Variable         | Description                          | Required |
|------------------|--------------------------------------|----------|
| `MONGODB_URI`    | Full MongoDB Atlas connection string | Yes      |
| `NEXT_PUBLIC_SITE_URL` | Used for absolute links in emails etc. | Recommended |

---

## Tech Decisions

- Using Mongoose for rich schema validation and indexes.
- Connection is cached globally in development (standard Next.js + Mongoose pattern).
- All pages use **server components** for direct DB access (fast).
- Search uses both client form + server filtering.
- Clean Pakistan market price ranges (common local breakpoints).

---

## Deployment

### Recommended: Deploy on Vercel

This is a standard Next.js project and deploys perfectly on [Vercel](https://vercel.com).

**Steps:**

1. Push your code to GitHub (this repository).
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import the `mobileonline` repo.
3. Add the required **Environment Variables** (see table below).
4. Click **Deploy**.

Vercel will automatically detect the Next.js framework.

### Required Environment Variables

| Variable                    | Description                                      | Required |
|-----------------------------|--------------------------------------------------|----------|
| `MONGODB_URI`               | Full MongoDB Atlas connection string             | Yes      |
| `CLOUDINARY_CLOUD_NAME`     | Your Cloudinary cloud name                       | Yes      |
| `CLOUDINARY_API_KEY`        | Your Cloudinary API key                          | Yes      |
| `CLOUDINARY_API_SECRET`     | Your Cloudinary API secret                       | Yes      |
| `NEXT_PUBLIC_SITE_URL`      | Your production URL (e.g. https://your-app.vercel.app) | Recommended |

> You can use the combined `CLOUDINARY_URL=cloudinary://...` format instead of the three separate variables.

**Important notes for production:**
- The **Add Phone** functionality is **development-only** (`process.env.NODE_ENV === 'development'`). On production builds it is hidden and the `/add-phone` page shows a "Restricted Area" message. This protects your site from public submissions.
- Make sure your MongoDB Atlas **Network Access** allows connections from Vercel (add `0.0.0.0/0` for simplicity, or specific Vercel IP ranges).
- Currency conversion and global pricing work automatically using free public APIs (no extra keys needed).

### Alternative Deployment Platforms

- **Railway** or **Render**: Good alternatives. Set the same environment variables.
- **Self-hosted**: Use `npm run build && npm start` (you will need to manage MongoDB connection and Cloudinary yourself).

### Running Seed in Production (if needed)

You can run the seed script against your production database:

```bash
MONGODB_URI=your-production-uri npm run seed
```

---

Built as a starting point. Extend it as much as you want.

Happy building! 📱🇵🇰

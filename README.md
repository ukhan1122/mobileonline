This is a **WhatMobile.com.pk** clone built with **Next.js 16 (App Router) + MongoDB Atlas**.

See complete guide and setup instructions: **[README-WHATMOBILE.md](./README-WHATMOBILE.md)**

## Quick Start

```bash
npm run dev
npm run seed   # (after setting MONGODB_URI)
```

Then open http://localhost:3000

Key pages:
- `/search`
- `/prices/under-20000`
- `/phones/samsung-galaxy-a35-5g`
- `/brands/samsung`


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel (Recommended)

This project is optimized for deployment on [Vercel](https://vercel.com).

### Quick Deploy Steps

1. **Push your code** (already done in this repo)
2. Go to [Vercel](https://vercel.com) → **New Project** → Import `ukhan1122/mobileonline`
3. Add the required **Environment Variables** (see below)
4. Click **Deploy**

Vercel will automatically detect it's a Next.js app and build it.

### Required Environment Variables (Vercel Dashboard → Settings → Environment Variables)

| Variable                  | Description                                      | Required |
|---------------------------|--------------------------------------------------|----------|
| `MONGODB_URI`             | Your MongoDB Atlas connection string             | Yes      |
| `CLOUDINARY_CLOUD_NAME`   | Cloudinary cloud name (for image uploads)        | Yes      |
| `CLOUDINARY_API_KEY`      | Cloudinary API key                               | Yes      |
| `CLOUDINARY_API_SECRET`   | Cloudinary API secret                            | Yes      |
| `NEXT_PUBLIC_SITE_URL`    | Your production domain (e.g. https://your-app.vercel.app) | Recommended |

> You can also use `CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME` instead of the three separate Cloudinary variables.

### After Deployment

- The **Add Phone** button and form are **development-only** (`process.env.NODE_ENV === 'development'`). On production they are hidden and the page shows a "Restricted Area" message.
- Currency conversion and country detection work automatically using free public APIs (no keys required).
- Make sure your MongoDB Atlas allows connections from Vercel (add `0.0.0.0/0` under Network Access or specific Vercel IPs).

### Custom Domain

In Vercel dashboard → Domains → add your custom domain.

## Local Development

```bash
npm install
# Add your variables to .env.local (copy from .env.local.example)
npm run dev
npm run seed   # optional - seeds demo data
```

Open [http://localhost:3000](http://localhost:3000).

## GitHub Repository

This project is hosted at: https://github.com/ukhan1122/mobileonline

Default branch: `main`

## Tech Stack

- Next.js 16 (App Router)
- MongoDB Atlas + Mongoose
- Cloudinary (image uploads)
- Tailwind CSS
- TypeScript

See the full setup guide: [README-WHATMOBILE.md](./README-WHATMOBILE.md)

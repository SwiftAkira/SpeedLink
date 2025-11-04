# SpeedLink App

Next.js 15 PWA with Supabase backend for real-time group location sharing.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard or use:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend & real-time subscriptions
- **PWA** - Installable, offline-capable app
- **Mapbox** - Coming soon for real-time maps

## Features

- ✅ PWA setup with offline support
- ✅ Supabase client configured
- 🚧 Authentication (Epic 2)
- 🚧 Real-time location sharing (Epic 3)
- 🚧 Speed camera alerts (Epic 4)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

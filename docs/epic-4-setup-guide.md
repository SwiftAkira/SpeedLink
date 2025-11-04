# Epic 4 Setup Guide

This guide will help you set up the Real-Time Map & Location features for SpeedLink.

## Prerequisites

- Node.js 18+ installed
- Supabase project configured
- Mapbox account (free tier)

## Step 1: Install Dependencies

Already completed! The following packages are installed:
- `mapbox-gl` v3.16.0
- `react-map-gl` v8.1.0
- `@types/mapbox-gl` v3.4.1

## Step 2: Get Mapbox Access Token

1. Go to https://account.mapbox.com/
2. Sign up for a free account (or log in)
3. Navigate to "Access Tokens" page
4. Create a new token OR copy your default public token
   - Format: `pk.eyJ1IjoiY...` (starts with `pk.`)
5. Copy the token

**Free Tier:** 50,000 map loads per month (sufficient for MVP testing)

## Step 3: Configure Environment Variables

### Local Development

Create `.env.local` in the `app/` directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local` and add your tokens:

```bash
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_key

# Mapbox (add this)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...your_token_here
```

### Production (Vercel)

1. Open your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:
   - **Name:** `NEXT_PUBLIC_MAPBOX_TOKEN`
   - **Value:** `pk.eyJ1...` (your token)
   - **Environment:** Production, Preview, Development (select all)
4. Click **Save**
5. Redeploy your application

## Step 4: Database Migration

The database migration is already complete! The `location_updates` table was created in Epic 3.

To verify, check Supabase:
1. Open Supabase Dashboard
2. Go to **Table Editor**
3. Verify `location_updates` table exists with these columns:
   - `id`, `user_id`, `party_id`, `latitude`, `longitude`, `speed`, `heading`, `accuracy`, `created_at`

## Step 5: Run the Application

```bash
cd app
npm run dev
```

Open http://localhost:3000

## Step 6: Test the Map

### Test Flow

1. **Login** to your account (or create one)
2. **Create a Party** or **Join a Party** using a 6-digit code
3. Navigate to **Dashboard**
4. Click **"Open Map"** on the Live Map card
5. **Allow Location Permission** when prompted by browser
6. You should see:
   - ✅ Map loads with dark theme
   - ✅ Your marker appears (lime green)
   - ✅ Party member list shows your name
   - ✅ Location updates every 3 seconds

### Multi-User Test

1. Open in **two different browsers** or devices
2. Both users join the **same party** (use party code)
3. Both navigate to `/map`
4. You should see:
   - ✅ Both markers appear on map
   - ✅ Real-time updates as users move
   - ✅ Speed indicators (if moving)
   - ✅ Direction arrows rotating

## Troubleshooting

### Map shows "Mapbox token not configured"
- Check `.env.local` has `NEXT_PUBLIC_MAPBOX_TOKEN`
- Restart dev server (`npm run dev`)
- Verify token starts with `pk.`

### Location permission denied
- Click the lock icon in browser address bar
- Reset location permission
- Refresh the page
- Allow when prompted again

### Markers not appearing
- Check browser console for errors
- Verify you're in an active party (`/party` page)
- Check Supabase for `location_updates` entries
- Verify RLS policies are enabled

### Real-time not working
- Check browser console for WebSocket errors
- Verify Supabase Realtime is enabled in project settings
- Check network tab for realtime connection
- Try refreshing both browser windows

### TypeScript errors for react-map-gl
- Restart TypeScript server in VS Code: `Cmd+Shift+P` → "Restart TS Server"
- Delete `node_modules` and reinstall: `npm install`

## Verification Checklist

- [ ] Mapbox token added to `.env.local`
- [ ] Dev server running (`npm run dev`)
- [ ] User logged in
- [ ] User in active party
- [ ] Map page loads at `/map`
- [ ] Location permission granted
- [ ] User marker appears
- [ ] Party member list shows correct data
- [ ] Tested with 2+ users (real-time updates work)

## What's Next?

Once Epic 4 is working:
- **Epic 5:** Speed Camera Alerts (will add markers to this map)
- **Epic 6:** Testing & Polish
- **Epic 7:** Production Deployment

## Support

If you encounter issues:
1. Check `app/map/README.md` for detailed docs
2. Review browser console for errors
3. Verify Supabase RLS policies in SQL Editor
4. Test location permissions in browser settings

---

**Epic 4 is ready to use! 🎉**

Happy mapping! 🗺️🏍️

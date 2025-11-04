# 🚀 Quick Start: Run Party Migration

## The Fastest Way (Recommended)

```powershell
cd app

# 1. Link to your Supabase project (first time only)
npx supabase link

# Follow prompts to select your project

# 2. Push the migration
npx supabase db push
```

**Done!** ✅ Your tables are now created on Supabase.

---

## Alternative: Test Locally First

```powershell
cd app

# Start local Supabase (automatically applies migrations)
npx supabase start

# This gives you:
# - Local PostgreSQL database
# - Local Supabase Studio at http://localhost:54323
# - All migrations applied

# Test your app locally
npm run dev

# When ready, push to production
npx supabase db push

# Stop local Supabase
npx supabase stop
```

---

## Verify It Worked

### Option 1: Check Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Open your project
3. Click "Table Editor"
4. You should see: `parties`, `party_members`, `location_updates`

### Option 2: Use CLI
```powershell
npx supabase migration list
```

Should show:
```
✓ 20251104230458_party_features.sql
```

---

## What This Migration Does

✅ Creates 3 tables with Row Level Security  
✅ Adds 12 security policies  
✅ Creates 9 indexes for fast queries  
✅ Adds party code generator function  
✅ Sets up real-time subscriptions  

---

## Need Help?

- Full guide: `/docs/supabase-cli-migration-guide.md`
- Migration file: `/app/supabase/migrations/20251104230458_party_features.sql`
- If CLI fails, copy migration file and paste in Supabase SQL Editor

---

## Next Steps After Migration

1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000/party
3. Create a party
4. Test with another browser window
5. Enjoy! 🎉

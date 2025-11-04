# Running Party Features Migration with Supabase CLI

## Prerequisites

- Supabase CLI installed (via npx)
- Supabase project created
- Project credentials ready

## Quick Start

### Option 1: Push to Remote Supabase (Recommended)

1. **Link your project** (first time only):
   ```powershell
   cd app
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```
   
   Get your project ref from: https://supabase.com/dashboard/project/_/settings/general
   
2. **Push the migration**:
   ```powershell
   npx supabase db push
   ```

That's it! Your tables and policies are now live on Supabase.

### Option 2: Local Development with Supabase

1. **Start local Supabase**:
   ```powershell
   cd app
   npx supabase start
   ```
   
   This will:
   - Start PostgreSQL locally
   - Apply all migrations
   - Provide local connection details

2. **Access local Studio**:
   - Open: http://localhost:54323
   - View tables, run queries, test features

3. **Stop when done**:
   ```powershell
   npx supabase stop
   ```

### Option 3: Manual SQL Editor (Fallback)

If CLI doesn't work, copy the migration file:
```powershell
cat supabase\migrations\20251104230458_party_features.sql
```

Then paste into Supabase SQL Editor at:
https://supabase.com/dashboard/project/_/sql

## Verify Migration

After running migration, check:

```powershell
# List all migrations
npx supabase migration list

# Check remote database
npx supabase db diff
```

Or in Supabase Dashboard:
1. Go to Table Editor
2. Verify tables: `parties`, `party_members`, `location_updates`
3. Check each table has RLS enabled

## Common Commands

```powershell
# Link to remote project
npx supabase link --project-ref <ref>

# Push all pending migrations
npx supabase db push

# Pull remote changes
npx supabase db pull

# Create new migration
npx supabase migration new <name>

# Reset local database
npx supabase db reset

# View migration status
npx supabase migration list
```

## Troubleshooting

### "Project not linked"
```powershell
npx supabase link --project-ref YOUR_PROJECT_REF
```

### "Migration already exists"
The migration has already been applied. Check with:
```powershell
npx supabase migration list
```

### "Permission denied"
Make sure you're logged in:
```powershell
npx supabase login
```

## Environment Setup

Create `.env.local` (if not exists):
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Get these from: https://supabase.com/dashboard/project/_/settings/api

## Next Steps

1. ✅ Run migration (choose option above)
2. ✅ Verify tables created
3. ✅ Test party creation at http://localhost:3000/party
4. ✅ Test real-time updates with two browsers

## Migration File Location

```
app/supabase/migrations/20251104230458_party_features.sql
```

This file is version-controlled and will be applied automatically in CI/CD.

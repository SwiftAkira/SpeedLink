# Supabase Migrations

This directory contains database migrations for SpeedLink.

## Current Migrations

- `20251104230458_party_features.sql` - Party/Group features (Epic 3)
  - Creates `parties`, `party_members`, `location_updates` tables
  - Sets up Row Level Security policies
  - Adds indexes for performance
  - Creates helper functions for party codes

## Running Migrations

### Remote (Production/Staging)

```powershell
# First time: Link to your Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to remote database
npx supabase db push
```

### Local Development

```powershell
# Start local Supabase (applies all migrations automatically)
npx supabase start

# View local Studio
# http://localhost:54323

# Stop when done
npx supabase stop
```

## Creating New Migrations

```powershell
# Create a new migration file
npx supabase migration new <migration_name>

# Edit the generated file in supabase/migrations/
# Then push to apply
npx supabase db push
```

## Migration Status

```powershell
# View which migrations have been applied
npx supabase migration list

# Check for differences between local and remote
npx supabase db diff
```

## Documentation

See `/docs/supabase-cli-migration-guide.md` for detailed instructions.

# How to Run Epic 3 Database Migration

## Method 1: Supabase CLI (Recommended) ⭐

This is the recommended approach for version control and reproducibility.

### Step 1: Link Your Project

```powershell
cd app
npx supabase link
```

Follow the prompts to select your SpeedLink project.

### Step 2: Push the Migration

```powershell
npx supabase db push
```

That's it! The migration is now applied. Skip to "Step 3: Verify Tables Created" below.

---

## Method 2: Supabase SQL Editor (Manual)

If CLI doesn't work, use the SQL Editor:

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Navigate to your SpeedLink project
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run the Migration

1. Click "New query" button
2. Open the file: `/app/supabase/migrations/20251104230458_party_features.sql`
3. Copy the entire contents of the file
4. Paste into the SQL Editor
5. Click "Run" button at the bottom right

## Step 3: Verify Tables Created

After running the migration, verify in the Table Editor:

1. Click "Table Editor" in the left sidebar
2. You should see three new tables:
   - `parties`
   - `party_members`
   - `location_updates`

## Step 4: Verify Policies

1. Click on each table (parties, party_members, location_updates)
2. Go to the "Policies" tab
3. Verify RLS is enabled
4. Check that policies are created for SELECT, INSERT, UPDATE, DELETE

## Step 5: Test the Functions

Run this test query to verify the party code generator works:

```sql
SELECT generate_party_code();
```

You should get a 6-digit code like "847362"

## What the Migration Does

The migration creates:

1. **3 Tables**: parties, party_members, location_updates
2. **12 RLS Policies**: Security policies for all operations
3. **9 Indexes**: Performance optimization for queries
4. **2 Functions**: 
   - `generate_party_code()` - Creates unique 6-digit codes
   - `update_party_member_last_seen()` - Auto-updates member activity
5. **2 Triggers**:
   - Updates party timestamps
   - Updates member last_seen on location update

## Troubleshooting

### Error: "relation already exists"
If you see this error, the tables already exist. You can either:
- Skip the migration (tables are already created)
- Drop existing tables first (careful: this deletes data!)

### Error: "permission denied"
Make sure you're logged in as the project owner or have sufficient permissions.

### Error: "function does not exist"
The `handle_updated_at()` function should exist from Epic 2. If not, check that the base migration was run first.

## Next Steps After Migration

1. Start the development server: `npm run dev`
2. Navigate to http://localhost:3000/party
3. Create a party and test the 6-digit code generation
4. Open a second browser window in incognito mode
5. Join the party using the code
6. Verify both users appear in the member list

## Rollback (If Needed)

To undo the migration and remove all party tables:

```sql
DROP TABLE IF EXISTS public.location_updates CASCADE;
DROP TABLE IF EXISTS public.party_members CASCADE;
DROP TABLE IF EXISTS public.parties CASCADE;
DROP FUNCTION IF EXISTS public.generate_party_code();
DROP FUNCTION IF EXISTS public.update_party_member_last_seen();
```

**Warning:** This will delete all party data!

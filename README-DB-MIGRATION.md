# Database Migration Instructions

This document outlines the steps needed to update your Supabase database to support the new roles and fields required for the THFC Scan application.

## Migration Files

The migration consists of three main SQL files:

1. `supabase/migrations/20250604_update_users_table.sql` - Updates the users table structure
2. `supabase/triggers/sync_users.sql` - Creates triggers to sync user data
3. `supabase/functions/get-current-user-role.sql` - Creates a function to get the current user's role

## Execution Options

### Option 1: Using Supabase Studio SQL Editor

1. Log in to the Supabase Dashboard and navigate to your project
2. Go to the SQL Editor
3. Copy and paste the contents of each SQL file and execute them in the following order:
   - First: `20250604_update_users_table.sql`
   - Second: `sync_users.sql`
   - Third: `get-current-user-role.sql`

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

1. Place the SQL files in their respective directories:
   - `supabase/migrations/20250604_update_users_table.sql`
   - `supabase/migrations/20250604_sync_users.sql`
   - `supabase/migrations/20250604_get-current-user-role.sql`

2. Run the migration:
   ```bash
   supabase db push
   ```

## Verifying the Migration

After running the migration, verify that:

1. The `users` table has a new `location` column
2. The role constraint has been updated to allow the new role types
3. Existing users have been updated with appropriate roles
4. The triggers are working correctly

You can verify these with the following SQL queries:

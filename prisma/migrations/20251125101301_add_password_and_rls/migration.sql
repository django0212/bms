/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL DEFAULT '$2a$10$CwTycUXWue0Thq9StjUM0u.1.1.1.1.1.1.1.1.1.1.1.1.1.1'; -- Dummy hash

-- Remove default after adding
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;

-- Enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "University" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Facility" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- 1. UNIVERSITY POLICIES
-- Everyone can read universities (needed for login domain check)
CREATE POLICY "Public read access for universities" ON "University"
  FOR SELECT USING (true);

-- Only Super Admins can modify universities (Placeholder logic: checks if user is super_admin)
-- Note: This relies on the app connecting as a privileged user or setting app.current_user_role
CREATE POLICY "Super Admin write access for universities" ON "University"
  FOR ALL USING (current_setting('app.current_user_role', true) = 'SUPER_ADMIN');


-- 2. USER POLICIES
-- Users can read their own data
CREATE POLICY "Users can read own data" ON "User"
  FOR SELECT USING (
    id::text = current_setting('app.current_user_id', true)
  );

-- Admins can read users from their university
CREATE POLICY "Admins can read university users" ON "User"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" as requestor
      WHERE requestor.id::text = current_setting('app.current_user_id', true)
      AND requestor.role = 'ADMIN'
      AND requestor."universityId" = "User"."universityId"
    )
  );


-- 3. FACILITY POLICIES
-- Users can read facilities from their university
CREATE POLICY "Users can read university facilities" ON "Facility"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" as requestor
      WHERE requestor.id::text = current_setting('app.current_user_id', true)
      AND requestor."universityId" = "Facility"."universityId"
    )
  );

-- Admins can write facilities for their university
CREATE POLICY "Admins can write university facilities" ON "Facility"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "User" as requestor
      WHERE requestor.id::text = current_setting('app.current_user_id', true)
      AND requestor.role = 'ADMIN'
      AND requestor."universityId" = "Facility"."universityId"
    )
  );

-- ============================================================================
-- SERVICE ROLE BYPASS
-- Ensure the application (connecting as postgres/service_role) always has access
-- regardless of the policies above.
-- ============================================================================
-- Note: 'postgres' and 'service_role' are superusers/bypassrls by default in Supabase,
-- so they ignore RLS. But if you use a custom role, you'd need this:
-- GRANT BYPASSRLS TO "your_app_user";

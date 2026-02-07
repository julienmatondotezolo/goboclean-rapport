-- Performance and Security Optimizations
-- This migration addresses Supabase linter warnings for better performance and security

-- Fix 1: Set search_path for security functions
-- This prevents search_path hijacking attacks
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'worker')
  );
  RETURN NEW;
END;
$$;

-- Fix 2: Optimize RLS policies by wrapping auth functions in SELECT
-- This prevents re-evaluation of auth.uid() for each row

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Workers can view their own reports" ON reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
DROP POLICY IF EXISTS "Workers can create their own reports" ON reports;
DROP POLICY IF EXISTS "Workers can update their own reports" ON reports;
DROP POLICY IF EXISTS "Workers can delete their own draft reports" ON reports;
DROP POLICY IF EXISTS "Users can view photos of their reports" ON photos;
DROP POLICY IF EXISTS "Users can insert photos to their reports" ON photos;
DROP POLICY IF EXISTS "Users can delete photos from their reports" ON photos;
DROP POLICY IF EXISTS "Only admins can update company settings" ON company_settings;

-- Recreate optimized policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING ((select auth.uid()) = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING ((select auth.uid()) = id);

-- Recreate optimized policies for reports table
CREATE POLICY "Workers can view their own reports"
  ON reports FOR SELECT
  USING (worker_id = (select auth.uid()));

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = 'admin'
    )
  );

CREATE POLICY "Workers can create their own reports"
  ON reports FOR INSERT
  WITH CHECK (worker_id = (select auth.uid()));

CREATE POLICY "Workers can update their own reports"
  ON reports FOR UPDATE
  USING (worker_id = (select auth.uid()));

CREATE POLICY "Workers can delete their own draft reports"
  ON reports FOR DELETE
  USING (worker_id = (select auth.uid()) AND status = 'draft');

-- Recreate optimized policies for photos table
CREATE POLICY "Users can view photos of their reports"
  ON photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = photos.report_id
      AND (reports.worker_id = (select auth.uid()) OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = (select auth.uid()) AND users.role = 'admin'
      ))
    )
  );

CREATE POLICY "Users can insert photos to their reports"
  ON photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = photos.report_id
      AND reports.worker_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete photos from their reports"
  ON photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = photos.report_id
      AND reports.worker_id = (select auth.uid())
    )
  );

-- Recreate optimized policy for company_settings table
CREATE POLICY "Only admins can update company settings"
  ON company_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = 'admin'
    )
  );

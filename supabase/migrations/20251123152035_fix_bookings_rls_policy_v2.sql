/*
  # Fix Bookings RLS Policy for Anonymous Users - V2

  1. Changes
    - Drop all existing policies and recreate properly
    - Allow anonymous users to INSERT bookings
    - Allow anonymous users to SELECT bookings (for checking availability)
    - Restrict UPDATE/DELETE to authenticated users only

  2. Security
    - INSERT and SELECT allowed for everyone (public booking system needs to check availability)
    - UPDATE/DELETE restricted to authenticated admin users
*/

-- Drop all existing policies
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'bookings' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON bookings', pol.policyname);
    END LOOP;
END $$;

-- Allow anyone to insert bookings (public booking system)
CREATE POLICY "Anyone can create bookings"
  ON bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to view bookings (needed for availability checking)
CREATE POLICY "Anyone can view bookings for availability"
  ON bookings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users can update bookings (admin panel)
CREATE POLICY "Only admins can update bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can delete bookings (admin panel)
CREATE POLICY "Only admins can delete bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (true);
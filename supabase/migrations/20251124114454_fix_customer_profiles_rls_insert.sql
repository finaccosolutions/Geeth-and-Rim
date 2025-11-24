/*
  # Fix Customer Profiles RLS Policy for INSERT

  1. Changes
    - Drop existing INSERT policy if it exists
    - Create proper INSERT policy that allows users to insert their own profile during signup
    - Policy uses WITH CHECK to verify the user is inserting their own profile
  
  2. Security
    - Users can only insert a profile for themselves (auth.uid() = id)
    - Prevents users from creating profiles for other users
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON customer_profiles;

-- Create proper INSERT policy with name
CREATE POLICY "Users can insert their own profile"
  ON customer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

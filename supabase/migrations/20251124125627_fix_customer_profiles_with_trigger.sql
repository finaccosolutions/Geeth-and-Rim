/*
  # Fix Customer Profiles with Auto-Create Trigger

  1. Changes
    - Create trigger function to automatically create customer profile on signup
    - Function reads data from auth.users metadata
    - Drop old manual INSERT policy
    - Add policy to allow trigger to insert profiles
  
  2. Security
    - Trigger runs with SECURITY DEFINER (elevated privileges)
    - RLS remains enabled
    - Users can only update their own profiles
    - Profile creation is automatic and secure
  
  3. How it works
    - User signs up with email, password, and metadata (full_name, phone)
    - Trigger automatically creates profile in customer_profiles table
    - No manual profile creation needed in application code
*/

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON customer_profiles;

-- Create trigger function to auto-create customer profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customer_profiles (id, email, full_name, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires after user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Keep existing SELECT policy (users can view their own profile)
-- Keep existing UPDATE policy (users can update their own profile)

-- Note: No INSERT policy needed - trigger handles profile creation with SECURITY DEFINER
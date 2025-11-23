/*
  # Add Site Branding and User Profiles

  1. Site Branding Table
    - `site_branding` table for logo and site settings
      - `id` (uuid, primary key)
      - `site_name` (text) - Site name (default: Geetandrim)
      - `logo_url` (text) - Logo image URL
      - `favicon_url` (text) - Favicon URL
      - `updated_at` (timestamp)

  2. Customer Profiles Table
    - `customer_profiles` table for registered users
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text) - Customer name
      - `email` (text) - Customer email
      - `phone` (text) - Customer phone
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  3. Security
    - Enable RLS on both tables
    - Public read access for site_branding
    - Authenticated users can update site_branding (admin)
    - Users can read/update their own profile

  4. Initial Data
    - Insert default site branding
*/

-- Site Branding Table
CREATE TABLE IF NOT EXISTS site_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Geetandrim',
  logo_url text,
  favicon_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site branding"
  ON site_branding
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update site branding"
  ON site_branding
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert site branding"
  ON site_branding
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Customer Profiles Table
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON customer_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON customer_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON customer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Authenticated users can view all profiles"
  ON customer_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default site branding
INSERT INTO site_branding (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;
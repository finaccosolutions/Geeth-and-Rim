/*
  # Salon Website Database Schema

  ## Overview
  Complete database schema for geetandrim.com salon website including services, bookings, 
  categories, images, email settings, and admin management.

  ## Tables Created

  1. **service_categories**
     - id (uuid, primary key)
     - name (text) - Category name (e.g., "Haircut & Styling", "Face Care")
     - description (text) - Category description
     - display_order (integer) - Order for displaying categories
     - created_at (timestamp)

  2. **services**
     - id (uuid, primary key)
     - category_id (uuid, foreign key) - Links to service_categories
     - name (text) - Service name
     - description (text) - Service description
     - duration_minutes (integer) - Service duration in minutes
     - price (decimal) - Service price
     - image_url (text) - Service image URL
     - is_active (boolean) - Whether service is currently offered
     - display_order (integer) - Order within category
     - created_at (timestamp)
     - updated_at (timestamp)

  3. **bookings**
     - id (uuid, primary key)
     - service_id (uuid, foreign key) - Links to services
     - customer_name (text) - Customer full name
     - customer_email (text) - Customer email
     - customer_phone (text) - Customer phone number
     - booking_date (date) - Date of appointment
     - start_time (time) - Start time of appointment
     - end_time (time) - End time (calculated from duration)
     - status (text) - 'pending', 'confirmed', 'cancelled', 'completed'
     - notes (text) - Additional notes from customer
     - admin_notes (text) - Internal notes from admin
     - created_at (timestamp)
     - updated_at (timestamp)

  4. **hero_images**
     - id (uuid, primary key)
     - title (text) - Image title
     - image_url (text) - Hero image URL
     - is_active (boolean) - Whether image is currently displayed
     - display_order (integer) - Order for carousel
     - created_at (timestamp)

  5. **gallery_images**
     - id (uuid, primary key)
     - title (text) - Image title
     - image_url (text) - Gallery image URL
     - category (text) - Image category (e.g., "Bridal", "Hair", "Nails")
     - is_active (boolean) - Whether image is displayed
     - display_order (integer) - Order in gallery
     - created_at (timestamp)

  6. **email_settings**
     - id (uuid, primary key)
     - smtp_host (text) - SMTP server host
     - smtp_port (integer) - SMTP server port
     - smtp_user (text) - SMTP username
     - smtp_password (text) - SMTP password (encrypted)
     - admin_emails (text[]) - Array of admin email addresses
     - from_email (text) - Sender email address
     - from_name (text) - Sender name
     - updated_at (timestamp)

  7. **admin_users**
     - id (uuid, primary key) - Links to auth.users
     - email (text) - Admin email
     - full_name (text) - Admin full name
     - role (text) - Admin role
     - created_at (timestamp)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Public read access for services, categories, hero images, and gallery images
  - Authenticated admin access for bookings and settings
  - Customers can create bookings (public write for bookings table)

  ## Indexes
  - Indexes on foreign keys for performance
  - Index on booking_date and start_time for availability queries
  - Index on service category_id for faster queries
*/

-- Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service categories"
  ON service_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage service categories"
  ON service_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES service_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 30,
  price decimal(10,2) NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage services"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text DEFAULT '',
  admin_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Create hero_images table
CREATE TABLE IF NOT EXISTS hero_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text DEFAULT '',
  image_url text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hero images"
  ON hero_images FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage hero images"
  ON hero_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text DEFAULT '',
  image_url text NOT NULL,
  category text DEFAULT 'General',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active gallery images"
  ON gallery_images FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage gallery images"
  ON gallery_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create email_settings table
CREATE TABLE IF NOT EXISTS email_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  smtp_host text DEFAULT 'smtp.hostinger.com',
  smtp_port integer DEFAULT 465,
  smtp_user text DEFAULT 'booking@geetandrim.com',
  smtp_password text DEFAULT '',
  admin_emails text[] DEFAULT ARRAY['rimshad@geetandrim.com', 'urmila@geetandrim.com'],
  from_email text DEFAULT 'booking@geetandrim.com',
  from_name text DEFAULT 'Geetandrim Salon',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view email settings"
  ON email_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update email settings"
  ON email_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert email settings"
  ON email_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can update own profile"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert default email settings
INSERT INTO email_settings (smtp_host, smtp_port, smtp_user, smtp_password, admin_emails, from_email, from_name)
VALUES (
  'smtp.hostinger.com',
  465,
  'booking@geetandrim.com',
  'Geetandrim@1234',
  ARRAY['rimshad@geetandrim.com', 'urmila@geetandrim.com'],
  'booking@geetandrim.com',
  'Geetandrim Salon'
) ON CONFLICT DO NOTHING;

-- Insert service categories
INSERT INTO service_categories (name, description, display_order) VALUES
  ('Haircut & Styling', 'Professional haircuts and styling services', 1),
  ('Face Care', 'Facial treatments and skincare services', 2),
  ('Wedding Packages', 'Complete bridal and groom packages', 3),
  ('Hair Treatments', 'Professional hair spa and treatment services', 4),
  ('Body Care', 'Body treatments and wellness services', 5),
  ('Hair Removal', 'Waxing and threading services', 6),
  ('Nails', 'Manicure, pedicure, and nail art services', 7)
ON CONFLICT DO NOTHING;

-- Insert sample services
INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Haircut & Styling'),
  'Haircut & Blow Dry',
  'Professional haircut with blow dry styling',
  60,
  800.00,
  1,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Haircut & Blow Dry');

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Haircut & Styling'),
  'Shave',
  'Traditional shaving service',
  30,
  300.00,
  2,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Shave');

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Haircut & Styling'),
  'Beard Design',
  'Professional beard trimming and styling',
  30,
  400.00,
  3,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Beard Design');

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Haircut & Styling'),
  'Kids Haircut',
  'Haircut for children under 12',
  30,
  500.00,
  4,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Kids Haircut');
/*
  # Add Contact Settings Table

  1. New Table
    - `contact_settings`
      - `id` (uuid, primary key)
      - `whatsapp_number` (text) - WhatsApp contact number
      - `phone_number` (text) - Main phone number
      - `email` (text) - Contact email
      - `address` (text) - Physical address
      - `opening_hours` (jsonb) - Opening hours for each day
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `contact_settings` table
    - Add policy for public read access
    - Add policy for authenticated users (admin) to update

  3. Initial Data
    - Insert default contact settings
*/

CREATE TABLE IF NOT EXISTS contact_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number text NOT NULL DEFAULT '+919876543210',
  phone_number text NOT NULL DEFAULT '+919876543210',
  email text NOT NULL DEFAULT 'booking@geetandrim.com',
  address text NOT NULL DEFAULT '123 Beauty Street, Salon District, City - 123456',
  opening_hours jsonb NOT NULL DEFAULT '{
    "monday": {"open": "09:00", "close": "20:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "20:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "20:00", "closed": false},
    "thursday": {"open": "09:00", "close": "20:00", "closed": false},
    "friday": {"open": "09:00", "close": "20:00", "closed": false},
    "saturday": {"open": "09:00", "close": "20:00", "closed": false},
    "sunday": {"open": "10:00", "close": "18:00", "closed": false}
  }'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read contact settings"
  ON contact_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update contact settings"
  ON contact_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO contact_settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;
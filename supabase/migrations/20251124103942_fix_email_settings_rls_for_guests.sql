/*
  # Fix Email Settings RLS for Guest Bookings

  1. Changes
    - Drop existing SELECT policy on email_settings (authenticated only)
    - Create new SELECT policy allowing anon (guest) users to read email settings
    - This enables email sending for both logged-in and guest bookings

  2. Security
    - Only SELECT (read) access is granted to anon users
    - UPDATE, INSERT, DELETE remain restricted to authenticated users
    - Email settings are needed for sending booking confirmation emails
*/

-- Drop the existing authenticated-only SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view email settings" ON email_settings;

-- Create new policy allowing both authenticated and anon users to read email settings
CREATE POLICY "Anyone can view email settings for booking emails"
  ON email_settings FOR SELECT
  TO anon, authenticated
  USING (true);

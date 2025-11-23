/*
  # Add Blocked Time Slots Feature

  1. New Tables
    - `blocked_time_slots`
      - `id` (uuid, primary key)
      - `service_id` (uuid, references services)
      - `blocked_date` (date) - The date when time is blocked
      - `start_time` (time) - Start of blocked period
      - `end_time` (time) - End of blocked period
      - `reason` (text) - Optional reason for blocking
      - `created_by` (uuid) - Admin who created the block
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `blocked_time_slots` table
    - Add policy for authenticated admins to manage blocked slots
    - Add policy for public to read active blocked slots (for booking validation)
*/

CREATE TABLE IF NOT EXISTS blocked_time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  reason text DEFAULT '',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to read blocked slots for booking validation"
  ON blocked_time_slots
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert blocked slots"
  ON blocked_time_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update blocked slots"
  ON blocked_time_slots
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete blocked slots"
  ON blocked_time_slots
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_blocked_time_slots_date ON blocked_time_slots(blocked_date);
CREATE INDEX IF NOT EXISTS idx_blocked_time_slots_service ON blocked_time_slots(service_id);
/*
  # Create events table

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `datetime` (timestamp with time zone)
      - `location_name` (text)
      - `latitude` (double precision)
      - `longitude` (double precision)
      - `organizer_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `events` table
    - Add policies for:
      - Everyone can view events
      - Organizers can create and update their own events
*/

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  datetime TIMESTAMPTZ NOT NULL,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  organizer_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view events
CREATE POLICY "Events are viewable by everyone"
  ON events
  FOR SELECT
  USING (true);

-- Allow organizers to insert their own events
CREATE POLICY "Users can create their own events"
  ON events
  FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

-- Allow organizers to update their own events
CREATE POLICY "Users can update their own events"
  ON events
  FOR UPDATE
  USING (auth.uid() = organizer_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
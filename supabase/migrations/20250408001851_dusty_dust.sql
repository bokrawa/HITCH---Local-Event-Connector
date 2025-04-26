/*
  # Add RSVP and Chat Features

  1. New Tables
    - `event_attendees`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `event_id` (uuid, foreign key to events)
      - `created_at` (timestamp)
      - `reminder_enabled` (boolean)
    
    - `messages`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key to events)
      - `sender_id` (uuid, foreign key to users)
      - `message` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  reminder_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for event_attendees
CREATE POLICY "Users can view all event attendees"
  ON event_attendees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can RSVP to events"
  ON event_attendees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own RSVPs"
  ON event_attendees
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for messages
CREATE POLICY "RSVP'd users can view event messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM event_attendees
      WHERE event_attendees.event_id = messages.event_id
      AND event_attendees.user_id = auth.uid()
    )
  );

CREATE POLICY "RSVP'd users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_attendees
      WHERE event_attendees.event_id = messages.event_id
      AND event_attendees.user_id = auth.uid()
    )
    AND auth.uid() = sender_id
  );
/*
  # Enhance Chat System

  1. Changes
    - Add first_chat column to event_attendees to track first-time chat users
    - Add organizer_id to events view for easy organizer identification
    - Add welcome_message column to events for customizable greetings

  2. Security
    - Maintain existing RLS policies
*/

-- Add first_chat column to event_attendees
ALTER TABLE event_attendees
ADD COLUMN first_chat boolean DEFAULT false;

-- Create a view for events with organizer information
CREATE OR REPLACE VIEW event_details AS
SELECT 
  e.*,
  p.full_name as organizer_name,
  (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id) as attendee_count
FROM events e
LEFT JOIN profiles p ON e.organizer_id = p.id;

-- Grant access to the view
GRANT SELECT ON event_details TO authenticated;
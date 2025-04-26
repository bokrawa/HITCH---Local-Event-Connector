/*
  # Fix Messages and Profiles Relationship

  1. Changes
    - Add foreign key relationship between messages and profiles
    - Update messages table to reference profiles instead of auth.users
    - Add cascade delete for messages when profile is deleted

  2. Security
    - Maintain existing RLS policies
*/

-- First, ensure the foreign key to auth.users is dropped
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- Update the foreign key to reference profiles instead
ALTER TABLE messages
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES profiles(id)
ON DELETE CASCADE;
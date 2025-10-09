-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS organization_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Update food_listings table for multiple images
ALTER TABLE food_listings
ADD COLUMN IF NOT EXISTS image_urls TEXT[],
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Migrate existing photo_url to image_urls array
UPDATE food_listings
SET image_urls = ARRAY[photo_url]
WHERE photo_url IS NOT NULL AND photo_url != '' AND image_urls IS NULL;

-- Create food_requests table
CREATE TABLE IF NOT EXISTS food_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  people_count INTEGER NOT NULL CHECK (people_count > 0),
  food_preference TEXT NOT NULL CHECK (food_preference IN ('vegetarian', 'non_vegetarian', 'vegan', 'any')),
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')),
  needed_by TIMESTAMPTZ NOT NULL,
  notes TEXT,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  location_address TEXT NOT NULL,
  delivery_preference TEXT DEFAULT 'pickup' CHECK (delivery_preference IN ('pickup', 'delivery')),
  organization_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for food_requests
ALTER TABLE food_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for food_requests
CREATE POLICY "Anyone can view active requests"
  ON food_requests FOR SELECT
  USING (status = 'active' AND needed_by > NOW());

CREATE POLICY "Receivers can create requests"
  ON food_requests FOR INSERT
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Receivers can view their own requests"
  ON food_requests FOR SELECT
  USING (auth.uid() = receiver_id);

CREATE POLICY "Receivers can update their own requests"
  ON food_requests FOR UPDATE
  USING (auth.uid() = receiver_id);

CREATE POLICY "Receivers can delete their own requests"
  ON food_requests FOR DELETE
  USING (auth.uid() = receiver_id);

-- Indexes for food_requests
CREATE INDEX IF NOT EXISTS idx_food_requests_location ON food_requests(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_food_requests_status ON food_requests(status, needed_by);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (user1_id < user2_id)
);

-- Add unique constraint for conversations
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);

-- Enable RLS for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() IN (user1_id, user2_id));

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IN (user1_id, user2_id));

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() IN (user1_id, user2_id));

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL CHECK (LENGTH(message_text) <= 5000),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND auth.uid() IN (user1_id, user2_id)
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, sender_id) WHERE read_at IS NULL;

-- Enable realtime for messages and conversations
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Function: Get or create conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conversation_id UUID;
  current_user_id UUID := auth.uid();
  user1 UUID;
  user2 UUID;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Ensure consistent ordering (smaller UUID first)
  IF current_user_id < other_user_id THEN
    user1 := current_user_id;
    user2 := other_user_id;
  ELSE
    user1 := other_user_id;
    user2 := current_user_id;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO conversation_id
  FROM conversations
  WHERE user1_id = user1 AND user2_id = user2;

  -- Create if doesn't exist
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (user1_id, user2_id)
    VALUES (user1, user2)
    RETURNING id INTO conversation_id;
  END IF;

  RETURN conversation_id;
END;
$$;

-- Function: Mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_conversation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE messages
  SET read_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND sender_id != auth.uid()
    AND read_at IS NULL;
END;
$$;

-- Function: Auto-expire old requests
CREATE OR REPLACE FUNCTION expire_old_requests()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE food_requests
  SET status = 'expired'
  WHERE status = 'active'
    AND needed_by < NOW();
END;
$$;
-- Create chat messages table for live support
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'admin')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view own messages"
ON public.chat_messages
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create messages
CREATE POLICY "Users can create messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id AND sender = 'user');

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON public.chat_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert messages (replies)
CREATE POLICY "Admins can insert messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update messages (mark as read)
CREATE POLICY "Admins can update messages"
ON public.chat_messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
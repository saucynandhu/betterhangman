-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  wins_hard INTEGER DEFAULT 0,
  wins_impossible INTEGER DEFAULT 0,
  wins_kitten INTEGER DEFAULT 0,
  losses_hard INTEGER DEFAULT 0,
  losses_impossible INTEGER DEFAULT 0,
  losses_kitten INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Games table
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('hard', 'impossible', 'kitten')),
  word TEXT NOT NULL,
  won BOOLEAN NOT NULL,
  wrong_guesses INTEGER NOT NULL,
  total_guesses INTEGER NOT NULL,
  xp_gained INTEGER NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Friends table
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_user_id ON public.games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_mode ON public.games(mode);
CREATE INDEX IF NOT EXISTS idx_games_played_at ON public.games(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON public.friends(friend_id);

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  RETURN FLOOR(SQRT(GREATEST(xp_amount, 0) / 100.0))::INTEGER + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update profile XP and level
CREATE OR REPLACE FUNCTION update_profile_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET xp = xp + NEW.xp_gained,
      level = calculate_level(xp + NEW.xp_gained),
      updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Update mode-specific stats
  IF NEW.won THEN
    IF NEW.mode = 'hard' THEN
      UPDATE public.profiles SET wins_hard = wins_hard + 1 WHERE id = NEW.user_id;
    ELSIF NEW.mode = 'impossible' THEN
      UPDATE public.profiles SET wins_impossible = wins_impossible + 1 WHERE id = NEW.user_id;
    ELSIF NEW.mode = 'kitten' THEN
      UPDATE public.profiles SET wins_kitten = wins_kitten + 1 WHERE id = NEW.user_id;
    END IF;
  ELSE
    IF NEW.mode = 'hard' THEN
      UPDATE public.profiles SET losses_hard = losses_hard + 1 WHERE id = NEW.user_id;
    ELSIF NEW.mode = 'impossible' THEN
      UPDATE public.profiles SET losses_impossible = losses_impossible + 1 WHERE id = NEW.user_id;
    ELSIF NEW.mode = 'kitten' THEN
      UPDATE public.profiles SET losses_kitten = losses_kitten + 1 WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile when game is inserted
CREATE TRIGGER update_profile_on_game
AFTER INSERT ON public.games
FOR EACH ROW
EXECUTE FUNCTION update_profile_xp();

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Games policies
CREATE POLICY "Users can view all games" ON public.games
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own games" ON public.games
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Friends policies
CREATE POLICY "Users can view all friendships" ON public.friends
  FOR SELECT USING (true);

CREATE POLICY "Users can add friendships" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own friendships" ON public.friends
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);


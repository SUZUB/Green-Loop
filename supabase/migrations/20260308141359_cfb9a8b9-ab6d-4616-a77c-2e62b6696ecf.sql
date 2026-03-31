
-- Profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  total_recycled_kg NUMERIC NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  total_pickups INTEGER NOT NULL DEFAULT 0,
  consecutive_weeks INTEGER NOT NULL DEFAULT 0,
  referral_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_key TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  badge_desc TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON public.user_badges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Recycling pickups history
CREATE TABLE public.recycling_pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight_kg NUMERIC NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  pickup_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recycling_pickups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pickups" ON public.recycling_pickups
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pickups" ON public.recycling_pickups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

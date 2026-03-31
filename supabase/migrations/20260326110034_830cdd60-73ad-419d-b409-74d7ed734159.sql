
-- Add missing columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'recycler';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coin_balance integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lng double precision;

-- Update handle_new_user trigger to store role from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'recycler')
  );
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create complete_pickup_transaction RPC
CREATE OR REPLACE FUNCTION public.complete_pickup_transaction(
  p_picker_id uuid,
  p_recycler_id uuid,
  p_weight_kg numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_points integer;
  v_tx_id uuid;
BEGIN
  v_points := FLOOR(p_weight_kg * 100);

  INSERT INTO pickup_transactions (picker_id, recycler_id, weight_kg, points_earned)
  VALUES (p_picker_id, p_recycler_id, p_weight_kg, v_points)
  RETURNING id INTO v_tx_id;

  INSERT INTO recycling_pickups (user_id, weight_kg, points_earned, status)
  VALUES (p_recycler_id, p_weight_kg, v_points, 'completed');

  UPDATE profiles
  SET total_recycled_kg = total_recycled_kg + p_weight_kg,
      total_points = total_points + v_points,
      total_pickups = total_pickups + 1,
      coin_balance = coin_balance + v_points,
      updated_at = now()
  WHERE id = p_recycler_id;

  RETURN jsonb_build_object(
    'transaction_id', v_tx_id,
    'points', v_points,
    'weight_kg', p_weight_kg
  );
END;
$$;

-- Allow authenticated users to read any profile (needed for QR scan name lookup)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (true);

-- Allow pickers to update any profile lat/lng (needed for geolocation)
-- Actually only own profile update is needed, which already exists

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

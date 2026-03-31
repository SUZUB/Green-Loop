
-- Create pickup_transactions table
CREATE TABLE public.pickup_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  picker_id uuid NOT NULL,
  recycler_id uuid NOT NULL,
  weight_kg numeric NOT NULL DEFAULT 0,
  points_earned integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pickup_transactions ENABLE ROW LEVEL SECURITY;

-- Pickers can view their own transactions
CREATE POLICY "Pickers can view own transactions"
  ON public.pickup_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = picker_id);

-- Recyclers can view their own transactions
CREATE POLICY "Recyclers can view own transactions"
  ON public.pickup_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = recycler_id);

-- Pickers can insert transactions
CREATE POLICY "Pickers can insert transactions"
  ON public.pickup_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = picker_id);

-- Create the record_pickup function
CREATE OR REPLACE FUNCTION public.record_pickup(
  p_picker_id uuid,
  p_recycler_id uuid,
  p_weight_kg numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_points integer;
  v_tx_id uuid;
BEGIN
  -- Calculate points: 100 points per kg
  v_points := FLOOR(p_weight_kg * 100);

  -- Insert transaction
  INSERT INTO pickup_transactions (picker_id, recycler_id, weight_kg, points_earned)
  VALUES (p_picker_id, p_recycler_id, p_weight_kg, v_points)
  RETURNING id INTO v_tx_id;

  -- Insert into recycling_pickups for the recycler
  INSERT INTO recycling_pickups (user_id, weight_kg, points_earned, status)
  VALUES (p_recycler_id, p_weight_kg, v_points, 'completed');

  -- Update recycler profile stats
  UPDATE profiles
  SET total_recycled_kg = total_recycled_kg + p_weight_kg,
      total_points = total_points + v_points,
      total_pickups = total_pickups + 1,
      updated_at = now()
  WHERE id = p_recycler_id;

  RETURN jsonb_build_object(
    'transaction_id', v_tx_id,
    'points', v_points,
    'weight_kg', p_weight_kg
  );
END;
$$;

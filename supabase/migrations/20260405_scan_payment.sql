ALTER TABLE public.pickup_transactions
  ALTER COLUMN recycler_id DROP NOT NULL;

ALTER TABLE public.pickup_transactions
  ADD COLUMN IF NOT EXISTS scan_id UUID,
  ADD COLUMN IF NOT EXISTS plastic_type VARCHAR(16);

ALTER TABLE public.pickup_transactions
  ADD CONSTRAINT pickup_transactions_scan_id_key UNIQUE (scan_id);

CREATE OR REPLACE FUNCTION public.process_scan_payment(
  p_scan_id       UUID,
  p_recycler_id   UUID,
  p_plastic_type  VARCHAR,
  p_weight_kg     DOUBLE PRECISION,
  p_coins_earned  INT,
  p_scan_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_picker_id          UUID := auth.uid();
  v_tx_id              UUID;
  v_recycler_new_bal   INT;
BEGIN
  IF v_picker_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = 'P0401';
  END IF;

  IF p_weight_kg <= 0 THEN
    RAISE EXCEPTION 'invalid_weight' USING ERRCODE = 'P0020';
  END IF;

  IF p_coins_earned < 1 THEN
    RAISE EXCEPTION 'invalid_coins' USING ERRCODE = 'P0021';
  END IF;

  IF p_recycler_id IS NULL THEN
    RAISE EXCEPTION 'recycler_id_required' USING ERRCODE = 'P0022';
  END IF;

  -- Credit coins to the RECYCLER's account
  UPDATE public.profiles
  SET coin_balance      = coin_balance + p_coins_earned,
      total_points      = total_points + p_coins_earned,
      total_recycled_kg = total_recycled_kg + p_weight_kg,
      updated_at        = now()
  WHERE id = p_recycler_id
  RETURNING coin_balance INTO v_recycler_new_bal;

  IF v_recycler_new_bal IS NULL THEN
    RAISE EXCEPTION 'recycler_not_found' USING ERRCODE = 'P0023';
  END IF;

  -- Record the transaction (picker performed the scan, recycler receives credits)
  INSERT INTO public.pickup_transactions
    (picker_id, recycler_id, weight_kg, points_earned, scan_id, plastic_type)
  VALUES
    (v_picker_id, p_recycler_id, p_weight_kg, p_coins_earned, p_scan_id, p_plastic_type)
  RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object(
    'transaction_id',       v_tx_id,
    'scan_id',              p_scan_id,
    'recycler_id',          p_recycler_id,
    'coins_earned',         p_coins_earned,
    'recycler_new_balance', v_recycler_new_bal,
    'timestamp',            now()
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Full schema extension: item_types, transaction_items, credit_history,
-- qr_code_scans, camera_logs + profile column additions
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extend profiles with missing fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_number    varchar(20),
  ADD COLUMN IF NOT EXISTS address         text,
  ADD COLUMN IF NOT EXISTS city            varchar(100),
  ADD COLUMN IF NOT EXISTS state           varchar(100),
  ADD COLUMN IF NOT EXISTS postal_code     varchar(20),
  ADD COLUMN IF NOT EXISTS picker_code     varchar(32) unique,
  ADD COLUMN IF NOT EXISTS is_active       boolean not null default true,
  ADD COLUMN IF NOT EXISTS last_login      timestamptz;

-- Auto-generate picker_code for existing picker profiles that don't have one
UPDATE public.profiles
SET picker_code = 'PKR-' || upper(substring(encode(gen_random_bytes(6), 'hex'), 1, 8))
WHERE role = 'picker' AND picker_code IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. item_types — reference table for all recyclable material categories
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.item_types (
  id              uuid primary key default gen_random_uuid(),
  item_name       varchar(64) not null unique,
  item_category   varchar(32) not null,
  display_label   varchar(128) not null,
  credits_per_unit double precision not null default 0,
  unit_type       varchar(16) not null default 'each',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

ALTER TABLE public.item_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read item_types"
  ON public.item_types FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Seed the item types (matches Camera 2 CREDIT_RATES)
INSERT INTO public.item_types (item_name, item_category, display_label, credits_per_unit, unit_type) VALUES
  ('PET_BOTTLE',           'plastic',   'Plastic Bottle (PET #1)',    2,   'each'),
  ('HDPE_BOTTLE',          'plastic',   'Plastic Bottle (HDPE #2)',   2,   'each'),
  ('METAL_CAN_ALUMINUM',   'metal',     'Aluminum Can',               3,   'each'),
  ('METAL_CAN_STEEL',      'metal',     'Steel Can',                  3,   'each'),
  ('GLASS_BOTTLE_CLEAR',   'glass',     'Glass Bottle (Clear)',       2,   'each'),
  ('GLASS_BOTTLE_COLORED', 'glass',     'Glass Bottle (Colored)',     2,   'each'),
  ('CARDBOARD',            'cardboard', 'Cardboard',                  1,   'kg'),
  ('PAPER',                'paper',     'Paper',                      1,   'kg'),
  ('TETRA_PACK',           'composite', 'Tetra Pack',                 1.5, 'each'),
  ('PLASTIC_OTHER',        'plastic',   'Mixed / Other Plastic',      0,   'each'),
  ('NON_RECYCLABLE',       'waste',     'Non-Recyclable',             0,   'each')
ON CONFLICT (item_name) DO UPDATE
  SET credits_per_unit = EXCLUDED.credits_per_unit,
      display_label    = EXCLUDED.display_label,
      unit_type        = EXCLUDED.unit_type;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. transaction_items — line-item detail for each pickup_transaction
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transaction_items (
  id                  uuid primary key default gen_random_uuid(),
  transaction_id      uuid not null references public.pickup_transactions(id) on delete cascade,
  item_type_id        uuid references public.item_types(id) on delete set null,
  item_name           varchar(64) not null,
  quantity            int not null default 1,
  weight_kg           double precision not null default 0,
  credits_per_unit    double precision not null default 0,
  credits_earned      double precision not null default 0,
  item_condition      varchar(16) not null default 'clean',
  is_rejected         boolean not null default false,
  rejection_reason    text,
  created_at          timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS transaction_items_tx_idx ON public.transaction_items(transaction_id);

ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read their transaction items"
  ON public.transaction_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pickup_transactions pt
      WHERE pt.id = transaction_id
        AND (pt.picker_id = auth.uid() OR pt.recycler_id = auth.uid())
    )
  );

CREATE POLICY "System can insert transaction items"
  ON public.transaction_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. credit_history — full audit trail of every credit movement
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.credit_history (
  id              uuid primary key default gen_random_uuid(),
  recycler_id     uuid not null references public.profiles(id) on delete cascade,
  transaction_id  uuid references public.pickup_transactions(id) on delete set null,
  credit_type     varchar(16) not null default 'earned',
  amount          double precision not null,
  balance_before  double precision not null,
  balance_after   double precision not null,
  description     text,
  created_at      timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS credit_history_recycler_idx ON public.credit_history(recycler_id);
CREATE INDEX IF NOT EXISTS credit_history_created_idx  ON public.credit_history(created_at desc);

ALTER TABLE public.credit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recyclers can read their own credit history"
  ON public.credit_history FOR SELECT
  USING (recycler_id = auth.uid());

CREATE POLICY "System can insert credit history"
  ON public.credit_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. qr_code_scans — log every Camera 1 QR scan attempt
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.qr_code_scans (
  id              uuid primary key default gen_random_uuid(),
  qr_code         text not null,
  recycler_id     uuid references public.profiles(id) on delete set null,
  picker_id       uuid references public.profiles(id) on delete set null,
  scan_status     varchar(16) not null default 'success',
  error_message   text,
  scan_timestamp  timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS qr_scans_picker_idx   ON public.qr_code_scans(picker_id);
CREATE INDEX IF NOT EXISTS qr_scans_recycler_idx ON public.qr_code_scans(recycler_id);
CREATE INDEX IF NOT EXISTS qr_scans_ts_idx       ON public.qr_code_scans(scan_timestamp desc);

ALTER TABLE public.qr_code_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pickers can read their own QR scans"
  ON public.qr_code_scans FOR SELECT
  USING (picker_id = auth.uid() OR recycler_id = auth.uid());

CREATE POLICY "Authenticated users can insert QR scans"
  ON public.qr_code_scans FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. camera_logs — log every Camera 1 and Camera 2 action
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.camera_logs (
  id              uuid primary key default gen_random_uuid(),
  camera_type     varchar(32) not null,
  picker_id       uuid references public.profiles(id) on delete set null,
  action_type     varchar(64) not null,
  items_detected  jsonb,
  scan_result     varchar(32),
  error_message   text,
  created_at      timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS camera_logs_picker_idx ON public.camera_logs(picker_id);
CREATE INDEX IF NOT EXISTS camera_logs_ts_idx     ON public.camera_logs(created_at desc);

ALTER TABLE public.camera_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pickers can read their own camera logs"
  ON public.camera_logs FOR SELECT
  USING (picker_id = auth.uid());

CREATE POLICY "Authenticated users can insert camera logs"
  ON public.camera_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Update process_scan_payment to also write credit_history + transaction_items
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.process_scan_payment(
  p_scan_id        UUID,
  p_recycler_id    UUID,
  p_plastic_type   VARCHAR,
  p_weight_kg      DOUBLE PRECISION,
  p_coins_earned   INT,
  p_scan_metadata  JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_picker_id          UUID := auth.uid();
  v_tx_id              UUID;
  v_recycler_new_bal   INT;
  v_recycler_old_bal   INT;
  v_item_type_id       UUID;
  v_line_items         JSONB;
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

  -- Fetch recycler's current balance before update
  SELECT coin_balance INTO v_recycler_old_bal
  FROM public.profiles WHERE id = p_recycler_id;

  IF v_recycler_old_bal IS NULL THEN
    RAISE EXCEPTION 'recycler_not_found' USING ERRCODE = 'P0023';
  END IF;

  -- Credit coins to the RECYCLER's account
  UPDATE public.profiles
  SET coin_balance      = coin_balance + p_coins_earned,
      total_points      = total_points + p_coins_earned,
      total_recycled_kg = total_recycled_kg + p_weight_kg,
      updated_at        = now()
  WHERE id = p_recycler_id
  RETURNING coin_balance INTO v_recycler_new_bal;

  -- Update picker's collection stats
  UPDATE public.profiles
  SET total_pickups = total_pickups + 1,
      updated_at    = now()
  WHERE id = v_picker_id;

  -- Insert main transaction record
  INSERT INTO public.pickup_transactions
    (picker_id, recycler_id, weight_kg, points_earned, scan_id, plastic_type)
  VALUES
    (v_picker_id, p_recycler_id, p_weight_kg, p_coins_earned, p_scan_id, p_plastic_type)
  RETURNING id INTO v_tx_id;

  -- Insert line items from scan metadata if provided
  v_line_items := p_scan_metadata -> 'lineItems';
  IF v_line_items IS NOT NULL AND jsonb_array_length(v_line_items) > 0 THEN
    FOR i IN 0 .. jsonb_array_length(v_line_items) - 1 LOOP
      SELECT id INTO v_item_type_id
      FROM public.item_types
      WHERE item_name = (v_line_items -> i ->> 'materialKind');

      INSERT INTO public.transaction_items
        (transaction_id, item_type_id, item_name, quantity, weight_kg,
         credits_per_unit, credits_earned, item_condition)
      VALUES (
        v_tx_id,
        v_item_type_id,
        coalesce(v_line_items -> i ->> 'displayType', p_plastic_type),
        coalesce((v_line_items -> i ->> 'count')::int, 1),
        coalesce((v_line_items -> i ->> 'weightKg')::double precision, p_weight_kg),
        coalesce((v_line_items -> i ->> 'creditsPerUnit')::double precision, 0),
        coalesce((v_line_items -> i ->> 'totalCredits')::double precision, 0),
        'clean'
      );
    END LOOP;
  ELSE
    -- Fallback: single line item from top-level params
    SELECT id INTO v_item_type_id FROM public.item_types WHERE item_name = p_plastic_type;
    INSERT INTO public.transaction_items
      (transaction_id, item_type_id, item_name, quantity, weight_kg,
       credits_per_unit, credits_earned, item_condition)
    VALUES (v_tx_id, v_item_type_id, p_plastic_type, 1, p_weight_kg, p_coins_earned, p_coins_earned, 'clean');
  END IF;

  -- Write credit_history audit record
  INSERT INTO public.credit_history
    (recycler_id, transaction_id, credit_type, amount, balance_before, balance_after, description)
  VALUES (
    p_recycler_id,
    v_tx_id,
    'earned',
    p_coins_earned,
    v_recycler_old_bal,
    v_recycler_new_bal,
    'Camera 2 item scan — ' || p_plastic_type
  );

  -- Log the QR scan
  INSERT INTO public.qr_code_scans
    (qr_code, recycler_id, picker_id, scan_status)
  VALUES (
    p_scan_id::text,
    p_recycler_id,
    v_picker_id,
    'success'
  );

  -- Log Camera 2 action
  INSERT INTO public.camera_logs
    (camera_type, picker_id, action_type, items_detected, scan_result)
  VALUES (
    'item_recognition',
    v_picker_id,
    'identify_and_pay',
    p_scan_metadata,
    'success'
  );

  RETURN jsonb_build_object(
    'transaction_id',       v_tx_id,
    'scan_id',              p_scan_id,
    'recycler_id',          p_recycler_id,
    'coins_earned',         p_coins_earned,
    'recycler_new_balance', v_recycler_new_bal,
    'recycler_old_balance', v_recycler_old_bal,
    'timestamp',            now()
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Helper function: log a Camera 1 QR scan attempt
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_qr_scan(
  p_qr_code      text,
  p_recycler_id  uuid,
  p_scan_status  varchar DEFAULT 'success',
  p_error        text    DEFAULT null
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.qr_code_scans
    (qr_code, recycler_id, picker_id, scan_status, error_message)
  VALUES (p_qr_code, p_recycler_id, auth.uid(), p_scan_status, p_error);

  INSERT INTO public.camera_logs
    (camera_type, picker_id, action_type, scan_result, error_message)
  VALUES ('qr_scanner', auth.uid(), 'scan_qr', p_scan_status, p_error);
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Trigger: auto-write credit_history when coin_balance changes on profiles
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_credit_balance_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.coin_balance <> OLD.coin_balance AND NEW.role = 'recycler' THEN
    INSERT INTO public.credit_history
      (recycler_id, credit_type, amount, balance_before, balance_after, description)
    VALUES (
      NEW.id,
      CASE WHEN NEW.coin_balance > OLD.coin_balance THEN 'earned' ELSE 'redeemed' END,
      abs(NEW.coin_balance - OLD.coin_balance),
      OLD.coin_balance,
      NEW.coin_balance,
      'Profile balance update'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_credit_balance_change ON public.profiles;
CREATE TRIGGER on_credit_balance_change
  AFTER UPDATE OF coin_balance ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_credit_balance_change();

-- Add new tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transaction_items;

-- Atomic cook creation with free-tier monthly limit enforcement.
--
-- Uses pg_advisory_xact_lock to serialize concurrent cook creation for the
-- same user, eliminating the TOCTOU race between the count check and the
-- insert that existed in the old client-side approach.
--
-- Returns jsonb:
--   { "cook_id": "<uuid>" }            on success
--   { "error": "COOK_LIMIT_REACHED" }  when free-tier limit is hit

CREATE OR REPLACE FUNCTION create_cook_if_under_limit(
  p_user_id            UUID,
  p_selected_items     JSONB,
  p_cooking_style      TEXT,
  p_eating_time        TIMESTAMPTZ,
  p_flavor_smoke       INT,
  p_flavor_bark        INT,
  p_flavor_tenderness  INT,
  p_smokers            JSONB,
  p_label              TEXT,
  p_smoker_type        TEXT,
  p_wood_type          TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier            TEXT;
  v_month_count     INT;
  v_month_start     TIMESTAMPTZ;
  v_prep_session_id UUID;
  v_cook_id         UUID;
  v_item            JSONB;
BEGIN
  -- Serialize concurrent cook creation for this user.
  -- pg_advisory_xact_lock is transaction-scoped and releases on commit/rollback.
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::TEXT)::BIGINT);

  -- Resolve the user's active subscription tier (defaults to 'free').
  SELECT COALESCE(s.tier, 'free') INTO v_tier
  FROM   subscriptions s
  WHERE  s.user_id = p_user_id
    AND  s.status  IN ('active', 'trialing')
  LIMIT  1;

  v_tier := COALESCE(v_tier, 'free');

  -- Enforce the 2-cook-per-month limit for free tier users.
  IF v_tier = 'free' THEN
    v_month_start := date_trunc('month', NOW() AT TIME ZONE 'UTC');

    SELECT COUNT(*) INTO v_month_count
    FROM   cooks c
    WHERE  c.user_id    = p_user_id
      AND  c.created_at >= v_month_start
      AND  c.created_at <  v_month_start + INTERVAL '1 month';

    IF v_month_count >= 2 THEN
      RETURN jsonb_build_object('error', 'COOK_LIMIT_REACHED');
    END IF;
  END IF;

  -- Insert the meal prep session.
  INSERT INTO meal_prep_sessions (
    user_id, selected_items, cooking_style, eating_time,
    flavor_smoke, flavor_bark, flavor_tenderness, notes, tools
  ) VALUES (
    p_user_id, p_selected_items, p_cooking_style, p_eating_time,
    p_flavor_smoke, p_flavor_bark, p_flavor_tenderness, '', p_smokers
  )
  RETURNING id INTO v_prep_session_id;

  -- Insert the cook record.
  INSERT INTO cooks (
    user_id, prep_session_id, label, cooking_style,
    smoker_type, wood_type, eat_time, status, plan
  ) VALUES (
    p_user_id, v_prep_session_id, p_label, p_cooking_style,
    p_smoker_type, p_wood_type, p_eating_time, 'in_progress',
    jsonb_build_object('tools', p_smokers, 'items', p_selected_items)
  )
  RETURNING id INTO v_cook_id;

  -- Insert one cook_item row per selected item.
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_selected_items)
  LOOP
    INSERT INTO cook_items (cook_id, name, notes)
    VALUES (
      v_cook_id,
      v_item->>'name',
      COALESCE(v_item->>'notes', '')
    );
  END LOOP;

  RETURN jsonb_build_object('cook_id', v_cook_id);
END;
$$;

GRANT EXECUTE ON FUNCTION create_cook_if_under_limit(
  UUID, JSONB, TEXT, TIMESTAMPTZ, INT, INT, INT, JSONB, TEXT, TEXT, TEXT
) TO service_role;

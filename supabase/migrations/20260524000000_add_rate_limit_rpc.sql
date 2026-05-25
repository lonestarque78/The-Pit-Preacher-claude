-- Atomic rate-limit check-and-increment.
--
-- Uses SELECT ... FOR UPDATE to serialize concurrent requests for the same
-- (user_id, endpoint) row. The entire read-decide-write happens inside one
-- PL/pgSQL transaction, eliminating the TOCTOU race in the old TypeScript
-- read-then-increment pattern.
--
-- Returns TRUE  → request is within limit, counter was incremented.
-- Returns FALSE → limit exceeded, counter was NOT incremented.

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id       UUID,
  p_endpoint      TEXT,
  p_window_seconds INT DEFAULT 60,
  p_max_requests   INT DEFAULT 20
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count        INT;
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Ensure a row exists so we can lock it. ON CONFLICT DO NOTHING is safe
  -- when two sessions race here: exactly one INSERT wins, the other is a
  -- no-op, and both then proceed to the FOR UPDATE below.
  INSERT INTO api_rate_limits (user_id, endpoint, request_count, window_start)
  VALUES (p_user_id, p_endpoint, 0, NOW())
  ON CONFLICT (user_id, endpoint) DO NOTHING;

  -- Acquire a row-level lock. Any concurrent call for the same key will block
  -- here until we commit, guaranteeing the following read-modify-write is
  -- serialized.
  SELECT request_count, window_start
  INTO   v_count, v_window_start
  FROM   api_rate_limits
  WHERE  user_id  = p_user_id
    AND  endpoint = p_endpoint
  FOR UPDATE;

  -- Window expired: reset counter and start a fresh window.
  IF EXTRACT(EPOCH FROM (NOW() - v_window_start)) > p_window_seconds THEN
    UPDATE api_rate_limits
    SET    request_count = 1,
           window_start  = NOW()
    WHERE  user_id  = p_user_id
      AND  endpoint = p_endpoint;
    RETURN TRUE;
  END IF;

  -- Limit reached: reject without touching the counter.
  IF v_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;

  -- Within limit: increment and allow.
  UPDATE api_rate_limits
  SET    request_count = request_count + 1
  WHERE  user_id  = p_user_id
    AND  endpoint = p_endpoint;

  RETURN TRUE;
END;
$$;

-- Allow the service role (used by the API route) to call this function.
GRANT EXECUTE ON FUNCTION check_rate_limit(UUID, TEXT, INT, INT) TO service_role;

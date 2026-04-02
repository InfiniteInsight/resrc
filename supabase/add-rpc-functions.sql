-- ============================================================
-- ADD MISSING RPC FUNCTIONS
-- Run this in the Supabase SQL Editor to add the resource
-- lookup functions that the API depends on.
-- ============================================================

-- Returns resources matching a location with proper scope filtering:
--   national      → always included
--   state         → must match state_code
--   county        → must match state_code AND county
--   city          → must match state_code AND county (city-scoped resources
--                    use the county field for geographic matching)
--   zip_specific  → must have matching row in resource_zip_codes
-- Results are ordered: local scopes first, then by score descending.
CREATE OR REPLACE FUNCTION get_resources_for_location(
  p_zip TEXT,
  p_city TEXT,
  p_county TEXT,
  p_state_code TEXT,
  p_category_slug TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  cat_slug TEXT,
  cat_name TEXT,
  cat_icon TEXT,
  subcategory TEXT,
  scope resource_scope,
  url TEXT,
  phone TEXT,
  address TEXT,
  eligibility_summary TEXT,
  income_limit_notes TEXT,
  hours TEXT,
  languages TEXT,
  net_score INT,
  verified_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.description,
    c.slug AS cat_slug,
    c.name AS cat_name,
    c.icon AS cat_icon,
    r.subcategory,
    r.scope,
    r.url,
    r.phone,
    r.address,
    r.eligibility_summary,
    r.income_limit_notes,
    r.hours,
    r.languages,
    r.net_score,
    r.verified_at
  FROM resources r
  JOIN categories c ON r.category_id = c.id
  LEFT JOIN resource_zip_codes rz ON r.id = rz.resource_id
  WHERE
    r.link_status = 'ok'
    AND (p_category_slug IS NULL OR c.slug = p_category_slug)
    AND (
      r.scope = 'national'
      OR (r.scope = 'state' AND r.state_code = p_state_code)
      OR (r.scope = 'county' AND r.state_code = p_state_code AND r.county = p_county)
      OR (r.scope = 'city' AND r.state_code = p_state_code AND r.county = p_county)
      OR (r.scope = 'zip_specific' AND rz.zip_code = p_zip)
    )
  ORDER BY
    CASE r.scope
      WHEN 'zip_specific' THEN 1
      WHEN 'city' THEN 2
      WHEN 'county' THEN 3
      WHEN 'state' THEN 4
      WHEN 'national' THEN 5
    END,
    r.net_score DESC,
    r.name ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Count version of the above (for pagination)
CREATE OR REPLACE FUNCTION count_resources_for_location(
  p_zip TEXT,
  p_city TEXT,
  p_county TEXT,
  p_state_code TEXT,
  p_category_slug TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  result BIGINT;
BEGIN
  SELECT COUNT(DISTINCT r.id) INTO result
  FROM resources r
  JOIN categories c ON r.category_id = c.id
  LEFT JOIN resource_zip_codes rz ON r.id = rz.resource_id
  WHERE
    r.link_status = 'ok'
    AND (p_category_slug IS NULL OR c.slug = p_category_slug)
    AND (
      r.scope = 'national'
      OR (r.scope = 'state' AND r.state_code = p_state_code)
      OR (r.scope = 'county' AND r.state_code = p_state_code AND r.county = p_county)
      OR (r.scope = 'city' AND r.state_code = p_state_code AND r.county = p_county)
      OR (r.scope = 'zip_specific' AND rz.zip_code = p_zip)
    );
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

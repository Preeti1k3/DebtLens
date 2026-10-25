
-- DebtLens: Stored function
-- Returns external debt stock for a country and year.
-- Values are illustrative demo data.

CREATE OR REPLACE FUNCTION get_country_external_debt(
    p_country_code CHAR(3),
    p_year INT
)
RETURNS NUMERIC(20, 4)
LANGUAGE SQL
STABLE
AS $$
    SELECT d.value
    FROM debt_observation d
    JOIN country c
        ON c.country_id = d.country_id
    JOIN indicator i
        ON i.indicator_id = d.indicator_id
    WHERE c.country_code = p_country_code
      AND d.year = p_year
      AND i.indicator_code = 'EXT_DEBT_USD';
$$;


-- DebtLens: Reusable database views
-- Uses illustrative demo data.

-- View 1: Latest-year external debt by country
CREATE OR REPLACE VIEW vw_country_external_debt AS
SELECT
    c.country_name,
    r.region_name,
    d.year,
    d.value AS external_debt_usd_millions
FROM debt_observation d
JOIN country c
    ON c.country_id = d.country_id
JOIN region r
    ON r.region_id = c.region_id
JOIN indicator i
    ON i.indicator_id = d.indicator_id
WHERE i.indicator_code = 'EXT_DEBT_USD';

-- View 2: Risk assessment with country details
CREATE OR REPLACE VIEW vw_country_risk_summary AS
SELECT
    c.country_name,
    r.region_name,
    ra.year,
    ra.risk_score,
    ra.risk_category,
    ra.explanation
FROM risk_assessment ra
JOIN country c
    ON c.country_id = ra.country_id
JOIN region r
    ON r.region_id = c.region_id;

-- View 3: Year-over-year external debt change
CREATE OR REPLACE VIEW vw_debt_growth AS
WITH annual_debt AS (
    SELECT
        c.country_id,
        c.country_name,
        d.year,
        d.value,
        LAG(d.value) OVER (
            PARTITION BY c.country_id
            ORDER BY d.year
        ) AS previous_year_debt
    FROM debt_observation d
    JOIN country c
        ON c.country_id = d.country_id
    JOIN indicator i
        ON i.indicator_id = d.indicator_id
    WHERE i.indicator_code = 'EXT_DEBT_USD'
)
SELECT
    country_name,
    year,
    value AS current_debt,
    previous_year_debt,
    ROUND(value - previous_year_debt, 2) AS absolute_change,
    ROUND(
        100.0 * (value - previous_year_debt)
        / NULLIF(previous_year_debt, 0),
        2
    ) AS percentage_change
FROM annual_debt;


-- DebtLens analytical reports
-- All results use illustrative demo data, not official statistics.

-- REPORT 1: External debt stock by country for 2023
SELECT c.country_name, d.year, d.value AS external_debt_usd_millions
FROM debt_observation d
JOIN country c ON c.country_id = d.country_id
JOIN indicator i ON i.indicator_id = d.indicator_id
WHERE i.indicator_code = 'EXT_DEBT_USD'
  AND d.year = 2023
ORDER BY d.value DESC;

-- REPORT 2: Average external debt by region for 2023
SELECT r.region_name,
       ROUND(AVG(d.value), 2) AS average_debt_usd_millions,
       COUNT(DISTINCT c.country_id) AS country_count
FROM debt_observation d
JOIN country c ON c.country_id = d.country_id
JOIN region r ON r.region_id = c.region_id
JOIN indicator i ON i.indicator_id = d.indicator_id
WHERE i.indicator_code = 'EXT_DEBT_USD'
  AND d.year = 2023
GROUP BY r.region_name
ORDER BY average_debt_usd_millions DESC;

-- REPORT 3: Year-over-year debt change using the LAG window function
WITH annual_debt AS (
    SELECT c.country_name, d.year, d.value,
           LAG(d.value) OVER (
               PARTITION BY c.country_id
               ORDER BY d.year
           ) AS previous_year_debt
    FROM debt_observation d
    JOIN country c ON c.country_id = d.country_id
    JOIN indicator i ON i.indicator_id = d.indicator_id
    WHERE i.indicator_code = 'EXT_DEBT_USD'
)
SELECT country_name, year, value AS current_debt,
       previous_year_debt,
       ROUND(value - previous_year_debt, 2) AS absolute_change,
       ROUND(
           100.0 * (value - previous_year_debt)
           / NULLIF(previous_year_debt, 0), 2
       ) AS percentage_change
FROM annual_debt
ORDER BY country_name, year;

-- REPORT 4: Risk assessment summary
SELECT c.country_name, ra.year, ra.risk_score,
       ra.risk_category, ra.explanation
FROM risk_assessment ra
JOIN country c ON c.country_id = ra.country_id
WHERE ra.year = 2023
ORDER BY ra.risk_score DESC;

-- REPORT 5: Countries with 2023 debt above the overall average
SELECT c.country_name, d.value AS external_debt_usd_millions
FROM debt_observation d
JOIN country c ON c.country_id = d.country_id
JOIN indicator i ON i.indicator_id = d.indicator_id
WHERE i.indicator_code = 'EXT_DEBT_USD'
  AND d.year = 2023
  AND d.value > (
      SELECT AVG(d2.value)
      FROM debt_observation d2
      JOIN indicator i2 ON i2.indicator_id = d2.indicator_id
      WHERE i2.indicator_code = 'EXT_DEBT_USD'
        AND d2.year = 2023
  )
ORDER BY d.value DESC;

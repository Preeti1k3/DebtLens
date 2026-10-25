
-- DebtLens demo data
-- IMPORTANT: Illustrative values for development/testing only.
-- These are NOT official World Bank statistics.

INSERT INTO region (region_name)
VALUES
    ('South Asia'),
    ('Latin America'),
    ('Europe and Central Asia')
ON CONFLICT (region_name) DO NOTHING;

INSERT INTO country (country_code, country_name, region_id)
SELECT v.country_code, v.country_name, r.region_id
FROM (VALUES
    ('IND', 'India', 'South Asia'),
    ('BGD', 'Bangladesh', 'South Asia'),
    ('BRA', 'Brazil', 'Latin America'),
    ('TUR', 'Turkiye', 'Europe and Central Asia')
) AS v(country_code, country_name, region_name)
JOIN region r ON r.region_name = v.region_name
ON CONFLICT (country_code) DO NOTHING;

INSERT INTO indicator (indicator_code, indicator_name, unit)
VALUES
    ('EXT_DEBT_USD', 'External debt stock', 'USD millions'),
    ('DEBT_GNI', 'External debt as percentage of GNI', 'Percent')
ON CONFLICT (indicator_code) DO NOTHING;

INSERT INTO creditor (creditor_name, creditor_type)
VALUES
    ('Multilateral creditors', 'Multilateral'),
    ('Bilateral creditors', 'Bilateral'),
    ('Private creditors', 'Private')
ON CONFLICT (creditor_name) DO NOTHING;

-- Illustrative external debt stock, USD millions
INSERT INTO debt_observation
    (country_id, indicator_id, year, value, source)
SELECT c.country_id, i.indicator_id, v.year, v.value,
       'Synthetic demo data'
FROM (VALUES
    ('IND', 2022, 620000.0::NUMERIC),
    ('IND', 2023, 650000.0::NUMERIC),
    ('BGD', 2022,  95000.0::NUMERIC),
    ('BGD', 2023, 100000.0::NUMERIC),
    ('BRA', 2022, 550000.0::NUMERIC),
    ('BRA', 2023, 580000.0::NUMERIC),
    ('TUR', 2022, 450000.0::NUMERIC),
    ('TUR', 2023, 470000.0::NUMERIC)
) AS v(country_code, year, value)
JOIN country c ON c.country_code = v.country_code
JOIN indicator i ON i.indicator_code = 'EXT_DEBT_USD'
ON CONFLICT (country_id, indicator_id, year) DO NOTHING;

-- Illustrative external debt/GNI percentages
INSERT INTO debt_observation
    (country_id, indicator_id, year, value, source)
SELECT c.country_id, i.indicator_id, v.year, v.value,
       'Synthetic demo data'
FROM (VALUES
    ('IND', 2022, 18.0::NUMERIC),
    ('IND', 2023, 19.0::NUMERIC),
    ('BGD', 2022, 21.0::NUMERIC),
    ('BGD', 2023, 22.0::NUMERIC),
    ('BRA', 2022, 30.0::NUMERIC),
    ('BRA', 2023, 31.0::NUMERIC),
    ('TUR', 2022, 45.0::NUMERIC),
    ('TUR', 2023, 47.0::NUMERIC)
) AS v(country_code, year, value)
JOIN country c ON c.country_code = v.country_code
JOIN indicator i ON i.indicator_code = 'DEBT_GNI'
ON CONFLICT (country_id, indicator_id, year) DO NOTHING;

INSERT INTO risk_assessment
    (country_id, year, risk_score, risk_category, explanation)
SELECT c.country_id, v.year, v.risk_score, v.risk_category,
       jsonb_build_object(
           'basis', 'Illustrative demonstration only',
           'method', 'Project-defined example score'
       )
FROM (VALUES
    ('IND', 2023, 25.0::NUMERIC, 'Low'),
    ('BGD', 2023, 45.0::NUMERIC, 'Moderate'),
    ('BRA', 2023, 55.0::NUMERIC, 'High'),
    ('TUR', 2023, 75.0::NUMERIC, 'Very High')
) AS v(country_code, year, risk_score, risk_category)
JOIN country c ON c.country_code = v.country_code
ON CONFLICT (country_id, year) DO NOTHING;

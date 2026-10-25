
-- DebtLens: Global External Debt Risk & Creditor Analysis System
-- Database: PostgreSQL

CREATE TABLE IF NOT EXISTS region (
    region_id SERIAL PRIMARY KEY,
    region_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS country (
    country_id SERIAL PRIMARY KEY,
    country_code CHAR(3) UNIQUE NOT NULL,
    country_name VARCHAR(150) UNIQUE NOT NULL,
    region_id INT REFERENCES region(region_id)
);

CREATE TABLE IF NOT EXISTS indicator (
    indicator_id SERIAL PRIMARY KEY,
    indicator_code VARCHAR(100) UNIQUE NOT NULL,
    indicator_name VARCHAR(200) NOT NULL,
    unit VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS debt_observation (
    observation_id BIGSERIAL PRIMARY KEY,
    country_id INT NOT NULL
        REFERENCES country(country_id),
    indicator_id INT NOT NULL
        REFERENCES indicator(indicator_id),
    year INT NOT NULL CHECK (year BETWEEN 1960 AND 2100),
    value NUMERIC(20, 4) CHECK (value >= 0),
    source VARCHAR(100) NOT NULL DEFAULT 'World Bank',
    UNIQUE (country_id, indicator_id, year)
);

CREATE TABLE IF NOT EXISTS creditor (
    creditor_id SERIAL PRIMARY KEY,
    creditor_name VARCHAR(150) UNIQUE NOT NULL,
    creditor_type VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS debt_creditor (
    observation_id BIGINT NOT NULL
        REFERENCES debt_observation(observation_id)
        ON DELETE CASCADE,
    creditor_id INT NOT NULL
        REFERENCES creditor(creditor_id),
    amount NUMERIC(20, 4) NOT NULL CHECK (amount >= 0),
    PRIMARY KEY (observation_id, creditor_id)
);

CREATE TABLE IF NOT EXISTS risk_assessment (
    assessment_id BIGSERIAL PRIMARY KEY,
    country_id INT NOT NULL
        REFERENCES country(country_id),
    year INT NOT NULL CHECK (year BETWEEN 1960 AND 2100),
    risk_score NUMERIC(5, 2) NOT NULL
        CHECK (risk_score BETWEEN 0 AND 100),
    risk_category VARCHAR(20) NOT NULL
        CHECK (risk_category IN (
            'Low', 'Moderate', 'High', 'Very High'
        )),
    explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (country_id, year)
);

-- Indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_debt_country_year
    ON debt_observation(country_id, year);

CREATE INDEX IF NOT EXISTS idx_debt_indicator_year
    ON debt_observation(indicator_id, year);

CREATE INDEX IF NOT EXISTS idx_risk_category_year
    ON risk_assessment(risk_category, year);

CREATE INDEX IF NOT EXISTS idx_debt_creditor_creditor
    ON debt_creditor(creditor_id);

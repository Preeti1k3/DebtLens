
-- DebtLens: Transaction demonstration
-- Run these statements interactively in psql.

-- TEST 1: COMMIT
BEGIN;

INSERT INTO region (region_name)
VALUES ('Transaction Demo Region');

COMMIT;

-- Verify that the committed row exists.
SELECT *
FROM region
WHERE region_name = 'Transaction Demo Region';


-- TEST 2: ROLLBACK
BEGIN;

INSERT INTO region (region_name)
VALUES ('Rollback Demo Region');

-- Undo the insert.
ROLLBACK;

-- Verify that the rolled-back row does not exist.
SELECT *
FROM region
WHERE region_name = 'Rollback Demo Region';

# DebtLens – Global External Debt Risk & Creditor Analysis System

## 1. Project Overview

DebtLens is a database-driven system designed to analyse and compare the external debt of countries across different geographical regions.

The system focuses on country-wise external debt, historical debt trends, regional comparisons, creditor relationships, and risk assessments.

It aims to provide a consolidated platform for understanding how countries' external debt changes over time and how their debt positions compare with other countries.

## 2. Objectives

- Store and manage external debt information in a structured database.
- Compare external debt across countries and geographical regions.
- Analyse year-on-year changes in external debt.
- Maintain information about creditors and debt relationships.
- Store country-level risk assessments.
- Generate analytical reports to support debt comparison and interpretation.

## 3. Technology Stack

| Component | Technology |
|---|---|
| Relational Database | PostgreSQL |
| NoSQL Database | MongoDB (project component, subject to integration status) |
| Frontend | Next.js |
| Programming Language | JavaScript / SQL |
| Database Queries | PostgreSQL SQL |

## 4. Database Design

The PostgreSQL database consists of seven main tables:

| Table | Description |
|---|---|
| `region` | Stores geographical regions. |
| `country` | Stores country information and region references. |
| `indicator` | Stores debt indicators and their units. |
| `debt_observation` | Stores country-wise debt observations for different years. |
| `creditor` | Stores creditor information. |
| `debt_creditor` | Represents relationships between debt observations and creditors. |
| `risk_assessment` | Stores country-level risk scores, categories, and explanations. |

## 5. Database Features

The PostgreSQL implementation includes:

- Primary keys and foreign keys.
- UNIQUE, NOT NULL, and CHECK constraints.
- Indexes for frequently queried columns.
- Analytical SQL queries using JOIN, GROUP BY, aggregate functions, and subqueries.
- Window functions using `LAG()` for year-on-year debt analysis.
- Three database views:
  - `vw_country_external_debt`
  - `vw_country_risk_summary`
  - `vw_debt_growth`
- A stored function: `get_country_external_debt()`.
- Transaction handling using COMMIT and ROLLBACK.
- JSONB for storing risk assessment explanations.

## 6. Analytical Capabilities

DebtLens supports:

1. Country-wise external debt comparison.
2. Regional average debt analysis.
3. Identification of countries whose debt exceeds the overall average.
4. Year-on-year debt growth analysis.
5. Country-level risk assessment summaries.
6. Creditor relationship modelling.

## 7. Project Structure

```text
DebtLens/
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── reports.sql
│   ├── views.sql
│   ├── functions.sql
│   └── transactions.sql
│
├── docs/
│   ├── ER_Diagram.md
│   └── ER_Diagram.png
│
├── web/
│   └── Next.js application
│
└── README.md
```

## 8. Running the PostgreSQL Database

### Prerequisites

- PostgreSQL installed.
- `psql` command-line tool available.

### Step 1: Create the database

```sql
CREATE DATABASE debtlens;
```

### Step 2: Execute the database scripts

From the project root directory, run:

```powershell
psql -U postgres -d debtlens -f .\database\schema.sql
psql -U postgres -d debtlens -f .\database\seed.sql
psql -U postgres -d debtlens -f .\database\views.sql
psql -U postgres -d debtlens -f .\database\functions.sql
psql -U postgres -d debtlens -f .\database\reports.sql
psql -U postgres -d debtlens -f .\database\transactions.sql
```

## 9. Sample Analytical Queries

### Country-wise external debt

```sql
SELECT *
FROM vw_country_external_debt
WHERE year = 2023
ORDER BY external_debt_usd_millions DESC;
```

### Regional debt comparison

The project uses aggregate SQL queries to calculate average external debt across geographical regions.

### Debt growth analysis

The `vw_debt_growth` view uses historical observations to compare debt values across years.

## 10. Project Limitations

- The current database demonstration uses synthetic illustrative sample data.
- Risk scores are illustrative and are not validated sovereign default predictions.
- Creditor-level analysis requires populated and verified creditor allocation data.
- Real-world financial conclusions require reliable historical data and a validated risk assessment methodology.

## 11. Future Enhancements

- Integration of verified external debt datasets.
- Expanded creditor-level analysis.
- Explainable debt-risk assessment.
- Interactive country and regional comparisons.
- Complete integration of the web application with the database.

## 12. Conclusion

DebtLens provides a structured database foundation for analysing global external debt. By connecting countries, regions, indicators, creditors, historical observations, and risk assessments, the project aims to make external debt information easier to organize, compare, and interpret.

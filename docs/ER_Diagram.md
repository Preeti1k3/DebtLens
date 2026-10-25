
erDiagram
    REGION ||--o{ COUNTRY : contains
    COUNTRY ||--o{ DEBT_OBSERVATION : records
    INDICATOR ||--o{ DEBT_OBSERVATION : defines
    DEBT_OBSERVATION ||--o{ DEBT_CREDITOR : allocated_to
    CREDITOR ||--o{ DEBT_CREDITOR : receives
    COUNTRY ||--o{ RISK_ASSESSMENT : assessed_for

    REGION {
        int region_id PK
        varchar region_name UK
    }

    COUNTRY {
        int country_id PK
        char country_code UK
        varchar country_name UK
        int region_id FK
    }

    INDICATOR {
        int indicator_id PK
        varchar indicator_code UK
        varchar indicator_name
        varchar unit
    }

    DEBT_OBSERVATION {
        bigint observation_id PK
        int country_id FK
        int indicator_id FK
        int year
        numeric value
        varchar source
    }

    CREDITOR {
        int creditor_id PK
        varchar creditor_name UK
        varchar creditor_type
    }

    DEBT_CREDITOR {
        bigint observation_id PK, FK
        int creditor_id PK, FK
        numeric amount
    }

    RISK_ASSESSMENT {
        bigint assessment_id PK
        int country_id FK
        int year
        numeric risk_score
        varchar risk_category
        jsonb explanation
        timestamptz assessed_at
    }

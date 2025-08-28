-- 1) Users: who owns data in the system
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT        NOT NULL UNIQUE,  -- natural unique key for login
  password_hash TEXT        NOT NULL,         
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) Budgets: one per user per month (e.g. "2025-08")
-- We use (user_id, month) as a logical unique pair.
CREATE TABLE IF NOT EXISTS budgets (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month      TEXT       NOT NULL,                         -- "YYYY-MM"
  limits     JSONB,                                       -- { "groceries": 300, "rent": 1000 }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_budget_per_user_month UNIQUE (user_id, month),
  CONSTRAINT ck_month_format CHECK (month ~ '^\d{4}-\d{2}$')  -- basic format guard
);

-- Helpful index to query "current month" data fast
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);

-- 3) Expenses: line items attached to a budget
CREATE TABLE IF NOT EXISTS expenses (
  id         BIGSERIAL PRIMARY KEY,
  budget_id  BIGINT      NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  amount     NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  category   TEXT,
  memo       TEXT,
  "date"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),          -- when the expense happened
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful index to list expenses by recency for a budget
CREATE INDEX IF NOT EXISTS idx_expenses_budget_date ON expenses(budget_id, "date");

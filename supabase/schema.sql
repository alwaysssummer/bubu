-- 부부 가계부 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. household 테이블 (가계부 단위)
CREATE TABLE IF NOT EXISTS household (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  person1_name TEXT DEFAULT '남편',
  person2_name TEXT DEFAULT '아내'
);

-- 2. transactions 테이블 (거래 내역)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES household(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  memo TEXT,
  person TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- transactions 인덱스
CREATE INDEX IF NOT EXISTS idx_transactions_household_id ON transactions(household_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_household_date ON transactions(household_id, date DESC);

-- 3. budget_items 테이블 (예산 체크 목록)
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES household(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  title TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  is_recurring BOOLEAN DEFAULT false,
  is_checked BOOLEAN DEFAULT false,
  month TEXT NOT NULL, -- 'YYYY-MM' 형식
  due_date INTEGER CHECK (due_date >= 1 AND due_date <= 31), -- 마감일 (1-31)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- budget_items 인덱스
CREATE INDEX IF NOT EXISTS idx_budget_items_household_id ON budget_items(household_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_month ON budget_items(household_id, month);

-- 4. todos 테이블 (할일 목록)
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES household(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  requester TEXT NOT NULL,
  assignee TEXT NOT NULL,
  due_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- todos 인덱스
CREATE INDEX IF NOT EXISTS idx_todos_household_id ON todos(household_id);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(household_id, due_date);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(household_id, is_completed);

-- 5. monthly_balances 테이블 (월별 이월 잔액)
CREATE TABLE IF NOT EXISTS monthly_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES household(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- 'YYYY-MM' 형식
  opening_balance INTEGER DEFAULT 0, -- 이월 잔액
  closing_balance INTEGER DEFAULT 0, -- 마감 잔액
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, month)
);

-- monthly_balances 인덱스
CREATE INDEX IF NOT EXISTS idx_monthly_balances_household_month ON monthly_balances(household_id, month);

-- Row Level Security (RLS) 정책
-- 링크만 알면 모든 데이터 접근 가능 (인증 불필요)

ALTER TABLE household ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_balances ENABLE ROW LEVEL SECURITY;

-- 모든 작업 허용 (링크 기반 접근)
CREATE POLICY "Enable all access for household" ON household FOR ALL USING (true);
CREATE POLICY "Enable all access for transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Enable all access for budget_items" ON budget_items FOR ALL USING (true);
CREATE POLICY "Enable all access for todos" ON todos FOR ALL USING (true);
CREATE POLICY "Enable all access for monthly_balances" ON monthly_balances FOR ALL USING (true);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE budget_items;
ALTER PUBLICATION supabase_realtime ADD TABLE todos;


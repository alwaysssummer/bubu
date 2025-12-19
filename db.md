# 🗄️ Database Document - 부부 가계부 DB 스키마

> **데이터베이스:** Supabase (PostgreSQL 15)  
> **마지막 업데이트:** 2025-12-19  
> **버전:** v1.0

---

## 📊 ERD (Entity Relationship Diagram)

```
┌─────────────────┐
│   household     │
│  (가계부 단위)    │
└────────┬────────┘
         │
         │ 1:N
         ├──────────────┬──────────────┬──────────────┐
         │              │              │              │
         ▼              ▼              ▼              ▼
┌────────────────┐ ┌────────────┐ ┌──────────┐ ┌─────────────────┐
│  transactions  │ │budget_items│ │  todos   │ │monthly_balances │
│  (거래 내역)    │ │ (예산 항목) │ │(할일목록)│ │  (월별 잔액)     │
└────────────────┘ └────────────┘ └──────────┘ └─────────────────┘
```

---

## 📋 테이블 상세

### 1. `household` - 가계부 단위

**목적:** 각 가계부의 기본 정보 저장

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | UUID | PRIMARY KEY | gen_random_uuid() | 가계부 고유 ID (링크용) |
| `created_at` | TIMESTAMPTZ | NOT NULL | NOW() | 생성 일시 |
| `person1_name` | TEXT | - | '남편' | 첫 번째 사용자 이름 |
| `person2_name` | TEXT | - | '아내' | 두 번째 사용자 이름 |

**인덱스:**
- PRIMARY KEY: `id`

**RLS 정책:**
```sql
CREATE POLICY "Enable all access for household" 
ON household FOR ALL USING (true);
```

**샘플 데이터:**
```sql
INSERT INTO household (id, person1_name, person2_name)
VALUES ('550e8400-e29b-41d4-a716-446655440000', '남편', '아내');
```

---

### 2. `transactions` - 거래 내역

**목적:** 수익/지출 거래 기록

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | UUID | PRIMARY KEY | gen_random_uuid() | 거래 고유 ID |
| `household_id` | UUID | NOT NULL, FK | - | 가계부 ID |
| `type` | TEXT | CHECK (IN 'income', 'expense') | - | 거래 유형 (수익/지출) |
| `amount` | INTEGER | CHECK (> 0) | - | 금액 (만원 단위) |
| `category` | TEXT | NOT NULL | - | 항목명 (예: 급여, 식비) |
| `date` | DATE | NOT NULL | CURRENT_DATE | 거래 날짜 |
| `memo` | TEXT | - | NULL | 메모 (선택사항) |
| `person` | TEXT | NOT NULL | - | 담당자 (남편/아내) |
| `created_at` | TIMESTAMPTZ | NOT NULL | NOW() | 생성 일시 |

**인덱스:**
```sql
CREATE INDEX idx_transactions_household_id ON transactions(household_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_household_date ON transactions(household_id, date DESC);
```

**외래키:**
```sql
FOREIGN KEY (household_id) REFERENCES household(id) ON DELETE CASCADE
```

**RLS 정책:**
```sql
CREATE POLICY "Enable all access for transactions" 
ON transactions FOR ALL USING (true);
```

**Realtime 활성화:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
```

**샘플 데이터:**
```sql
INSERT INTO transactions (household_id, type, amount, category, date, person)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'income', 300, '급여', '2025-12-01', '남편'),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 50, '식비', '2025-12-05', '아내');
```

---

### 3. `budget_items` - 예산 체크 목록

**목적:** 매월 반복되는 수익/지출 항목 관리

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | UUID | PRIMARY KEY | gen_random_uuid() | 예산 항목 ID |
| `household_id` | UUID | NOT NULL, FK | - | 가계부 ID |
| `type` | TEXT | CHECK (IN 'income', 'expense') | - | 유형 (수익/지출) |
| `title` | TEXT | NOT NULL | - | 항목명 |
| `amount` | INTEGER | CHECK (> 0) | - | 금액 (만원 단위) |
| `is_recurring` | BOOLEAN | - | false | 반복 항목 여부 |
| `is_checked` | BOOLEAN | - | false | 집행 여부 (체크됨) |
| `month` | TEXT | NOT NULL | - | 해당 월 (YYYY-MM) |
| `due_date` | INTEGER | CHECK (1-31) | NULL | 마감일 (1~31) |
| `created_at` | TIMESTAMPTZ | NOT NULL | NOW() | 생성 일시 |

**인덱스:**
```sql
CREATE INDEX idx_budget_items_household_id ON budget_items(household_id);
CREATE INDEX idx_budget_items_month ON budget_items(household_id, month);
```

**외래키:**
```sql
FOREIGN KEY (household_id) REFERENCES household(id) ON DELETE CASCADE
```

**RLS 정책:**
```sql
CREATE POLICY "Enable all access for budget_items" 
ON budget_items FOR ALL USING (true);
```

**Realtime 활성화:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE budget_items;
```

**비즈니스 로직:**
- `is_recurring=true`: 매월 자동 복사 (체크 해제 상태)
- `is_recurring=false` + 미체크: 다음 달에 "(전월)" 접미사 추가하여 복사

**샘플 데이터:**
```sql
INSERT INTO budget_items (household_id, type, title, amount, is_recurring, month, due_date)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'income', '급여', 300, true, '2025-12', 25),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', '월세', 80, true, '2025-12', 5);
```

---

### 4. `todos` - 할일 목록

**목적:** 부부간 할일 공유 및 관리

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | UUID | PRIMARY KEY | gen_random_uuid() | 할일 ID |
| `household_id` | UUID | NOT NULL, FK | - | 가계부 ID |
| `title` | TEXT | NOT NULL | - | 할일 제목 |
| `requester` | TEXT | NOT NULL | - | 요청자 (남편/아내) |
| `assignee` | TEXT | NOT NULL | - | 담당자 (남편/아내) |
| `due_date` | DATE | NOT NULL | - | 마감일 |
| `is_completed` | BOOLEAN | - | false | 완료 여부 |
| `memo` | TEXT | - | NULL | 완료 메모 |
| `created_at` | TIMESTAMPTZ | NOT NULL | NOW() | 생성 일시 |
| `completed_at` | TIMESTAMPTZ | - | NULL | 완료 일시 |

**인덱스:**
```sql
CREATE INDEX idx_todos_household_id ON todos(household_id);
CREATE INDEX idx_todos_due_date ON todos(household_id, due_date);
CREATE INDEX idx_todos_completed ON todos(household_id, is_completed);
```

**외래키:**
```sql
FOREIGN KEY (household_id) REFERENCES household(id) ON DELETE CASCADE
```

**RLS 정책:**
```sql
CREATE POLICY "Enable all access for todos" 
ON todos FOR ALL USING (true);
```

**Realtime 활성화:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE todos;
```

**샘플 데이터:**
```sql
INSERT INTO todos (household_id, title, requester, assignee, due_date)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', '전기세 납부', '아내', '남편', '2025-12-25');
```

---

### 5. `monthly_balances` - 월별 이월 잔액

**목적:** 월별 마감 잔액 저장 및 이월 관리

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | UUID | PRIMARY KEY | gen_random_uuid() | 레코드 ID |
| `household_id` | UUID | NOT NULL, FK | - | 가계부 ID |
| `month` | TEXT | NOT NULL | - | 해당 월 (YYYY-MM) |
| `opening_balance` | INTEGER | - | 0 | 이월 잔액 (전월 마감) |
| `closing_balance` | INTEGER | - | 0 | 마감 잔액 (당월 마감) |
| `created_at` | TIMESTAMPTZ | NOT NULL | NOW() | 생성 일시 |

**제약조건:**
```sql
UNIQUE(household_id, month)
```

**인덱스:**
```sql
CREATE INDEX idx_monthly_balances_household_month 
ON monthly_balances(household_id, month);
```

**외래키:**
```sql
FOREIGN KEY (household_id) REFERENCES household(id) ON DELETE CASCADE
```

**RLS 정책:**
```sql
CREATE POLICY "Enable all access for monthly_balances" 
ON monthly_balances FOR ALL USING (true);
```

**비즈니스 로직:**
- `opening_balance`: 전월 `closing_balance` 값
- `closing_balance`: 이월 + 수익 - 지출

**샘플 데이터:**
```sql
INSERT INTO monthly_balances (household_id, month, opening_balance, closing_balance)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', '2025-11', 0, 150),
  ('550e8400-e29b-41d4-a716-446655440000', '2025-12', 150, 200);
```

---

## 🔐 보안 설정

### Row Level Security (RLS)

**정책:** 모든 테이블에 대해 무제한 접근 허용

```sql
-- 모든 테이블 RLS 활성화
ALTER TABLE household ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_balances ENABLE ROW LEVEL SECURITY;

-- 모든 작업 허용 정책
CREATE POLICY "Enable all access for household" 
ON household FOR ALL USING (true);

CREATE POLICY "Enable all access for transactions" 
ON transactions FOR ALL USING (true);

CREATE POLICY "Enable all access for budget_items" 
ON budget_items FOR ALL USING (true);

CREATE POLICY "Enable all access for todos" 
ON todos FOR ALL USING (true);

CREATE POLICY "Enable all access for monthly_balances" 
ON monthly_balances FOR ALL USING (true);
```

**주의사항:**
- 링크(UUID)만 알면 누구나 접근 가능
- 간편함을 위해 인증 없이 설계
- 민감한 정보 입력 자제 권장

---

## ⚡ Realtime 설정

**활성화된 테이블:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE budget_items;
ALTER PUBLICATION supabase_realtime ADD TABLE todos;
```

**동작 방식:**
- INSERT, UPDATE, DELETE 이벤트 실시간 전송
- 여러 기기에서 동시 사용 시 자동 동기화
- WebSocket 기반 양방향 통신

---

## 📊 주요 쿼리 패턴

### 1. 현재 월 잔고 계산

```sql
-- 이월 잔액 조회
SELECT opening_balance 
FROM monthly_balances 
WHERE household_id = $1 AND month = $2;

-- 당월 수익 합계
SELECT COALESCE(SUM(amount), 0) AS total_income
FROM transactions
WHERE household_id = $1 
  AND type = 'income'
  AND date >= $2 AND date <= $3;

-- 당월 지출 합계
SELECT COALESCE(SUM(amount), 0) AS total_expense
FROM transactions
WHERE household_id = $1 
  AND type = 'expense'
  AND date >= $2 AND date <= $3;

-- 현재 잔고 = 이월 + 수익 - 지출
```

### 2. 거래 내역 조회 (최신순)

```sql
SELECT * FROM transactions
WHERE household_id = $1
  AND date >= $2 AND date <= $3
ORDER BY date DESC, created_at DESC
LIMIT 50;
```

### 3. 예산 항목 조회 (현재 월)

```sql
SELECT * FROM budget_items
WHERE household_id = $1 AND month = $2
ORDER BY type DESC, created_at ASC;
```

### 4. 할일 목록 조회 (미완료)

```sql
SELECT * FROM todos
WHERE household_id = $1 AND is_completed = false
ORDER BY due_date ASC;
```

### 5. 월별 통계 (최근 6개월)

```sql
SELECT 
  TO_CHAR(date, 'YYYY-MM') AS month,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
FROM transactions
WHERE household_id = $1
  AND date >= $2 AND date <= $3
GROUP BY TO_CHAR(date, 'YYYY-MM')
ORDER BY month ASC;
```

### 6. 카테고리별 지출 분석

```sql
SELECT 
  category,
  SUM(amount) AS total
FROM transactions
WHERE household_id = $1
  AND type = 'expense'
  AND date >= $2 AND date <= $3
GROUP BY category
ORDER BY total DESC;
```

---

## 🔄 데이터 마이그레이션

### 초기 스키마 생성

**파일:** `supabase/schema.sql`

```bash
# Supabase SQL Editor에서 실행
# 또는 CLI 사용
supabase db push
```

### 백업 & 복원

**백업:**
```bash
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

**복원:**
```bash
psql -h db.xxx.supabase.co -U postgres -d postgres < backup.sql
```

---

## 📈 데이터 통계

### 예상 데이터량 (1년 기준)

| 테이블 | 예상 레코드 수 | 용량 |
|--------|---------------|------|
| household | 1 | ~1KB |
| transactions | ~365 (1일 1건) | ~50KB |
| budget_items | ~120 (월 10건) | ~20KB |
| todos | ~50 (월 4건) | ~10KB |
| monthly_balances | 12 | ~2KB |
| **합계** | ~548 | **~83KB** |

**Supabase 무료 플랜:** 500MB (충분함)

---

## 🛠️ 유지보수

### 인덱스 재생성

```sql
REINDEX TABLE transactions;
REINDEX TABLE budget_items;
REINDEX TABLE todos;
```

### 오래된 데이터 정리 (선택사항)

```sql
-- 1년 이상 된 완료된 할일 삭제
DELETE FROM todos
WHERE is_completed = true 
  AND completed_at < NOW() - INTERVAL '1 year';
```

### 성능 모니터링

```sql
-- 테이블 크기 확인
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📝 변경 이력

### v1.0 (2025-12-19)
- 초기 스키마 완성
- 5개 테이블 생성
- RLS 정책 설정
- Realtime 활성화
- 인덱스 최적화

---

**마지막 업데이트:** 2025-12-19  
**버전:** v1.0  
**상태:** ✅ 프로덕션 레디

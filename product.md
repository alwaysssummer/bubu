# 📦 Product Document - 부부 가계부 (to_be_rich)

> **프로젝트 상태:** ✅ MVP 완료 (v1.0)  
> **마지막 업데이트:** 2025-12-19  
> **관리자:** Captain

---

## 🎯 프로젝트 개요

### 핵심 컨셉
**"링크 하나로 시작하는 부부 가계부"**

- 회원가입 없이 링크만으로 즉시 사용
- 부부가 실시간으로 동기화되는 가계부
- 1만원 단위 간편 입력으로 빠른 기록
- 예산 체크리스트 + 할일 목록 통합

### 타겟 사용자
- 신혼부부, 동거 커플
- 간단한 가계부가 필요한 사람들
- 복잡한 앱 싫어하는 사용자

---

## 🚀 핵심 기능 (v1.0)

### 1. 💰 가계부 메인
- **잔고 대시보드**
  - 현재 잔고 (만원 단위)
  - 이월 잔액 자동 계산
  - 월별 수익/지출 합계
  - 색상 구분 (수익: 초록, 지출: 빨강)

- **거래 내역**
  - 수익/지출 빠른 입력 (하단 버튼)
  - 항목 자동완성 (최근 사용 + 추천)
  - 담당자 선택 (남편/아내)
  - 날짜 선택 (캘린더)
  - 메모 기능
  - 수정/삭제

- **월 네비게이션**
  - 이전/다음 달 이동
  - 과거 내역 조회

- **통계 & 분석**
  - 월별 비교 차트 (최근 6개월)
  - 카테고리별 지출 분석
  - Progress Bar 시각화

### 2. 📋 예산 체크 목록
- 매월 반복 지출/수익 항목 관리
- 체크박스로 집행 여부 표시
- 예상 잔고 실시간 계산
- 수익/지출 섹션 분리
- 반복 항목 자동 이월 (전월 미체크 항목)

### 3. ✓ 할일 목록 (메인 화면 통합)
- 빠른 할일 추가 (Enter 키)
- 요청자/담당자 지정
- 마감일 설정
- 완료 처리 (메모 추가)
- 진행중/완료 섹션 분리
- 마감일 지남 강조 표시

### 4. 🔗 링크 기반 공유
- UUID 기반 고유 링크 생성
- 링크 복사 버튼
- 모바일 Web Share API 지원
- 인증 없이 링크만으로 접근

### 5. ⚡ 실시간 동기화
- Supabase Realtime 구독
- 여러 기기 동시 사용 가능
- 자동 데이터 갱신

### 6. 📱 모바일 최적화
- PWA 지원 (홈 화면 추가)
- 반응형 디자인
- 터치 최적화
- Apple Web App 지원

---

## 🛠️ 기술 스택

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Library:** shadcn/ui (Radix UI)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Date:** date-fns, react-day-picker
- **Theme:** next-themes (다크모드)
- **Toast:** Sonner

### Backend
- **Database:** Supabase (PostgreSQL)
- **Realtime:** Supabase Realtime
- **Auth:** 없음 (링크 기반)

### Deployment
- **Hosting:** Vercel
- **CI/CD:** Git push → 자동 배포

---

## 📁 프로젝트 구조

```
to_be_rich/
├── app/
│   ├── page.tsx                    # 랜딩 (새 가계부 생성)
│   ├── layout.tsx                  # 루트 레이아웃
│   └── [householdId]/              # 가계부 라우팅
│       ├── layout.tsx              # 공통 레이아웃 (탭바)
│       ├── page.tsx                # 가계부 메인 + 할일
│       ├── budget/                 # 예산 관리
│       │   └── page.tsx
│       └── test-connection/        # 디버깅 도구
│           └── page.tsx
├── components/
│   ├── ui/                         # shadcn/ui 컴포넌트
│   ├── TransactionDialog.tsx      # 거래 추가/수정 모달
│   ├── BudgetItemDialog.tsx       # 예산 항목 모달
│   ├── TodoDialog.tsx              # 할일 모달
│   ├── CategoryCombobox.tsx       # 항목 자동완성
│   ├── MonthlyChart.tsx            # 월별 차트
│   ├── CategoryAnalysis.tsx       # 카테고리 분석
│   └── LoadingSkeletons.tsx       # Skeleton UI
├── lib/
│   ├── supabase.ts                 # Supabase 클라이언트
│   ├── types.ts                    # TypeScript 타입
│   ├── utils.ts                    # 유틸리티 함수
│   └── hooks/
│       ├── useTransactions.ts      # 거래 내역 훅
│       └── useMonthlyBalance.ts    # 월별 잔고 훅
├── supabase/
│   └── schema.sql                  # DB 스키마
└── docs/
    ├── 빠른_시작_가이드.md
    ├── Supabase_설정_가이드.md
    ├── Vercel_배포_가이드.md
    ├── 개발플랜.md
    ├── 개발요약.md
    └── 개발_진행_상황.md
```

---

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary:** Vercel Black (#000000)
- **Accent:** Supabase Green (#3ECF8E)
- **Success:** Green (#22C55E)
- **Danger:** Red (#EF4444)
- **Background:** White / Dark (#0A0A0A)

### 타이포그래피
- **Font:** Inter (영문), Pretendard (한글)
- **Scale:** text-xs ~ text-4xl

### 컴포넌트 스타일
- 미니멀 디자인
- 부드러운 그림자 (shadow-sm)
- 둥근 모서리 (rounded-lg)
- 부드러운 애니메이션

---

## 📊 데이터베이스 스키마

> 상세 내용은 `db.md` 참고

### 테이블 목록
1. **household** - 가계부 단위
2. **transactions** - 거래 내역
3. **budget_items** - 예산 체크 목록
4. **todos** - 할일 목록
5. **monthly_balances** - 월별 이월 잔액

---

## 🔐 보안 & 권한

### Row Level Security (RLS)
- 모든 테이블: 링크만 알면 읽기/쓰기 가능
- 인증 불필요 (간편함 우선)

### 주의사항
- 링크 유출 시 누구나 접근 가능
- 민감한 정보 입력 자제 권장
- 개인용/부부용으로만 사용 권장

---

## 🚀 배포 정보

### 환경변수
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 배포 플랫폼
- **Production:** Vercel
- **Database:** Supabase

### 배포 방법
```bash
git push origin master
# Vercel 자동 배포
```

---

## 📈 버전 히스토리

### v1.0 (2025-12-19) - 현재 버전
- **v1.0**: MVP 완료 - 모든 핵심 기능 구현
  - 가계부 메인 (잔고, 거래, 통계)
  - 예산 체크 목록 (반복 항목)
  - 할일 목록 (메인 통합)
  - 실시간 동기화
  - PWA 지원
  - 성능 최적화 (Skeleton UI)

### 개발 로그 (2025-11-13 이전)
- 프로젝트 초기 설정
- 데이터베이스 스키마 구축
- 거래 CRUD 구현
- 월별 이월 로직
- 예산 관리 기능
- 통계 & 분석 추가
- 모바일 최적화
- 날짜 계산 버그 수정

---

## 🎯 향후 계획 (Phase 2)

### 우선순위 낮음 (MVP 아님)
- [ ] 검색 & 필터 기능
- [ ] CSV 데이터 백업/내보내기
- [ ] 카테고리 커스터마이징
- [ ] 다크모드 토글 버튼 (현재 시스템 설정 따름)
- [ ] 알림 기능 (마감일, 예산 초과)

---

## 📞 지원 & 문의

### 문서
- 빠른 시작: `docs/빠른_시작_가이드.md`
- Supabase 설정: `docs/Supabase_설정_가이드.md`
- 배포 가이드: `docs/Vercel_배포_가이드.md`

### 디버깅
- 연결 테스트: `/[householdId]/test-connection`

---

## 📝 개발 노트

### 주요 결정사항
1. **링크 기반 인증**
   - 회원가입 없이 즉시 사용 가능
   - UUID로 고유 링크 생성

2. **1만원 단위 입력**
   - 간편한 입력을 위해 만원 단위로 제한
   - 정확한 금액보다 빠른 기록 우선

3. **실시간 동기화**
   - Supabase Realtime으로 여러 기기 동시 사용
   - 별도 새로고침 불필요

4. **미니멀 디자인**
   - Vercel/Supabase 스타일 차용
   - 불필요한 요소 제거

5. **할일 메인 통합**
   - 별도 탭 대신 메인 화면에 통합
   - 빠른 입력 (Enter 키) 지원

### 알려진 제한사항
- Supabase 무료 플랜: 500MB DB, 1주일 비활성 시 일시 정지
- 1만원 단위로만 입력 가능 (원 단위 불가)
- 링크 기반 접근 (보안 주의)

---

**마지막 업데이트:** 2025-12-19  
**버전:** v1.0  
**상태:** ✅ 프로덕션 레디

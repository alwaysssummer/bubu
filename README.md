# 부부 가계부

> **🎉 MVP 완료! (v1.0)**  
> 링크 기반 간단 가계부 + 예산 관리 + 할일 공유 앱

## 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI**: shadcn/ui
- **Database**: Supabase (PostgreSQL + Realtime)
- **Deployment**: Vercel

## 🚀 빠른 시작

### ⚠️ 먼저 Supabase 설정이 필요합니다!

**📖 [`docs/빠른_시작_가이드.md`](docs/빠른_시작_가이드.md) 파일을 참고하세요** (5분 소요)

### 간단 요약:

1. **Supabase 프로젝트 생성** (https://supabase.com)
2. **`.env.local` 파일 생성** 및 환경변수 입력
3. **SQL 스크립트 실행** (`supabase/schema.sql`)
4. **개발 서버 실행**:

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

---

## 📋 상세 문서

- 🚀 [빠른 시작 가이드](docs/빠른_시작_가이드.md) - **처음 사용자 필독!**
- 🔧 [Supabase 설정 가이드](docs/Supabase_설정_가이드.md)
- 📝 [개발 플랜](docs/개발플랜.md)
- 📄 [개발 요약](docs/개발요약.md)

## 🎉 주요 기능

### 1. 💰 가계부 (실행)
- 1만원 단위로 수익/지출 간단 입력
- 월별 잔고 자동 계산
- 이전 달 잔액 자동 이월
- 거래 내역 실시간 동기화

### 2. 📋 예산 체크 목록
- 매월 반복 지출/수익 항목 관리
- 체크박스로 집행 여부 표시
- 예상 잔고 실시간 계산

### 3. ✓ 할일 목록
- 부부간 할일 공유
- 마감일 설정
- 완료 처리 및 메모

### 4. 📊 통계 & 분석 (신규!)
- 월별 비교 차트 (최근 6개월)
- 카테고리별 지출 분석
- 시각화된 데이터

### 5. 📱 모바일 최적화
- PWA 지원 (홈 화면 추가 가능)
- 반응형 디자인
- 터치 최적화

### 6. ⚡ 성능 최적화
- Skeleton UI로 빠른 로딩
- Suspense 경계로 UX 개선
- 실시간 동기화

## 프로젝트 구조

```
app/
├── page.tsx              # 랜딩 페이지 (새 가계부 생성)
├── layout.tsx            # 루트 레이아웃
├── [householdId]/        # 가계부 라우팅
│   ├── layout.tsx        # 공통 레이아웃 (탭바)
│   ├── page.tsx          # 가계부 메인
│   ├── budget/           # 예산 관리
│   └── todos/            # 할일 목록
components/
├── ui/                   # shadcn/ui 컴포넌트
└── ...                   # 커스텀 컴포넌트
lib/
├── supabase.ts           # Supabase 클라이언트
├── types.ts              # TypeScript 타입
└── utils.ts              # 유틸리티 함수
```

## 배포

Vercel에 자동 배포:

```bash
git push
```

환경변수를 Vercel 프로젝트 설정에도 추가하세요.

## 개발 플랜

자세한 개발 계획은 `docs/개발플랜.md` 참고

## 📈 개발 현황

### ✅ MVP 완료! (v1.0)

**핵심 기능 100% 구현**
- ✅ 프로젝트 초기 설정
- ✅ 데이터베이스 스키마
- ✅ 링크 기반 공유 (인증 없음)
- ✅ 가계부 메인 화면 (거래 내역)
- ✅ 거래 CRUD (1만원 단위)
- ✅ 월별 잔액 자동 계산 및 이월
- ✅ 예산 관리 (체크박스 실행 추적)
- ✅ 할일 관리 (빠른 입력, D-day)
- ✅ 통계 & 분석 (차트, 카테고리)
- ✅ 모바일 최적화 (PWA, 터치)
- ✅ 성능 최적화 (Skeleton, Suspense)
- ✅ 실시간 동기화
- ✅ 미니멀 UI/UX

### 🚀 향후 추가 가능 기능
- 검색 & 필터
- CSV 데이터 백업/내보내기
- 카테고리 커스터마이징

## 🚀 배포

Vercel에 바로 배포할 수 있습니다!

상세한 배포 가이드: `docs/Vercel_배포_가이드.md`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/to_be_rich)

## 📞 지원

문제가 발생하거나 질문이 있으시면 GitHub Issues를 이용해주세요.

## 📄 라이센스

MIT

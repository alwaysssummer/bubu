# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 로그인
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호 설정
4. 지역 선택 (권장: Northeast Asia (Seoul))
5. "Create new project" 클릭

## 2. 데이터베이스 스키마 생성

1. Supabase 대시보드에서 왼쪽 메뉴의 **"SQL Editor"** 클릭
2. "New query" 클릭
3. `supabase/schema.sql` 파일의 내용을 전체 복사
4. SQL Editor에 붙여넣기
5. 오른쪽 하단의 **"Run"** 버튼 클릭 (또는 Ctrl+Enter)
6. 성공 메시지 확인

## 3. 환경변수 설정

### 3-1. Supabase URL과 Key 가져오기

1. Supabase 대시보드에서 **"Settings"** (왼쪽 하단 톱니바퀴) 클릭
2. **"API"** 메뉴 클릭
3. 다음 정보를 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3-2. .env.local 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 입력:

```bash
NEXT_PUBLIC_SUPABASE_URL=여기에_Project_URL_입력
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_public_key_입력
```

예시:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Realtime 활성화 확인

1. Supabase 대시보드에서 **"Database"** → **"Replication"** 클릭
2. 다음 테이블들이 활성화되어 있는지 확인:
   - `transactions`
   - `budget_items`
   - `todos`
3. 비활성화 상태라면 토글 버튼을 클릭하여 활성화

## 5. 테스트

1. 개발 서버 실행:
```bash
npm run dev
```

2. 브라우저에서 http://localhost:3000 열기

3. "새 가계부 만들기" 클릭

4. 가계부가 생성되고 고유 링크로 이동되는지 확인

5. 거래 추가, 예산 항목, 할일 등록 테스트

## 6. 문제 해결

### 연결 오류
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 환경변수에 공백이나 따옴표가 없는지 확인
- 개발 서버를 재시작 (`Ctrl+C` 후 `npm run dev`)

### 데이터베이스 오류
- SQL 스크립트가 성공적으로 실행되었는지 확인
- Supabase 대시보드 → "Table Editor"에서 테이블이 생성되었는지 확인
- RLS 정책이 올바르게 설정되었는지 확인

### Realtime 오류
- Replication에서 해당 테이블들이 활성화되어 있는지 확인
- 브라우저 콘솔에서 WebSocket 연결 오류 확인

## 7. 프로덕션 배포 (Vercel)

1. Vercel 프로젝트 설정에서 Environment Variables 추가
2. `.env.local`의 내용을 동일하게 입력
3. 배포 후 환경변수가 적용되는지 확인

---

## 참고사항

- Supabase 무료 플랜은 500MB 데이터베이스 스토리지 제공
- 무료 플랜은 프로젝트 일시 정지 가능 (1주일 비활성 시)
- API 요청은 무제한이지만 rate limit 적용
- 자세한 내용은 [Supabase 문서](https://supabase.com/docs) 참고



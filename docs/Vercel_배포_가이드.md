# Vercel 배포 가이드

## 🚀 Vercel에 배포하기

### 사전 준비

1. GitHub 계정
2. Supabase 프로젝트 설정 완료
3. 로컬에서 정상 작동 확인

---

## 1단계: GitHub에 코드 푸시

### 1-1. Git 저장소 초기화 (이미 되어있음)

```bash
git add .
git commit -m "Initial commit - 부부 가계부 MVP 완성"
```

### 1-2. GitHub 저장소 생성 및 푸시

1. https://github.com 접속
2. "New repository" 클릭
3. 저장소 이름: `bubu-gagyebu` (또는 원하는 이름)
4. Private 선택 (권장)
5. "Create repository" 클릭

터미널에서:
```bash
git remote add origin https://github.com/your-username/bubu-gagyebu.git
git branch -M main
git push -u origin main
```

---

## 2단계: Vercel에 배포

### 2-1. Vercel 가입 및 프로젝트 연결

1. https://vercel.com 접속
2. "Sign Up" → GitHub로 로그인
3. "Add New..." → "Project" 클릭
4. GitHub 저장소 `bubu-gagyebu` 선택
5. "Import" 클릭

### 2-2. 환경변수 설정

**중요!** 배포 전 반드시 설정해야 합니다.

1. "Environment Variables" 섹션으로 스크롤
2. 다음 환경변수 추가:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: your-supabase-url (Supabase Project URL)

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your-supabase-anon-key (Supabase anon public key)
```

⚠️ **주의**: `.env.local`에 있는 동일한 값을 입력하세요!

### 2-3. 배포 설정

다음 설정은 자동으로 감지됩니다:
- Framework Preset: **Next.js**
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `.next`

### 2-4. 배포 시작

1. "Deploy" 버튼 클릭
2. 약 2-3분 대기
3. ✅ 배포 완료!

---

## 3단계: 배포 확인

### 3-1. 프로덕션 URL 확인

배포 완료 후 다음 형식의 URL이 생성됩니다:
```
https://bubu-gagyebu.vercel.app
```

또는:
```
https://bubu-gagyebu-your-username.vercel.app
```

### 3-2. 기능 테스트

1. 프로덕션 URL 접속
2. "새 가계부 만들기" 클릭
3. 거래 추가 테스트
4. 예산, 할일 기능 테스트
5. 통계 확인

---

## 4단계: 커스텀 도메인 연결 (선택사항)

### 4-1. 도메인이 있는 경우

1. Vercel 프로젝트 → "Settings" → "Domains"
2. "Add" 버튼 클릭
3. 도메인 입력 (예: `gagyebu.com`)
4. DNS 설정 안내 따라하기:
   - A 레코드 또는 CNAME 레코드 추가
   - 네임서버 변경 (선택)

### 4-2. Vercel 무료 도메인 사용

기본 제공되는 `.vercel.app` 도메인을 그대로 사용할 수 있습니다.

---

## 5단계: 자동 배포 설정

### 자동 배포는 이미 활성화됨!

Git push하면 자동으로 Vercel에 배포됩니다:

```bash
# 코드 수정 후
git add .
git commit -m "기능 추가"
git push

# → Vercel이 자동으로 감지하고 배포 시작!
```

### 배포 브랜치 설정

- **main 브랜치**: 프로덕션 배포
- **다른 브랜치**: 프리뷰 배포 (테스트용)

---

## 🔧 문제 해결

### 빌드 실패

#### 1. 환경변수 누락
```
Error: supabaseUrl is required
```
→ Vercel 환경변수에 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가

#### 2. 타입 에러
```
Type error: ...
```
→ 로컬에서 `npm run build` 실행하여 에러 확인 및 수정

#### 3. 모듈 누락
```
Module not found: Can't resolve '...'
```
→ `package.json`에 dependency가 있는지 확인

### 런타임 에러

#### 1. Supabase 연결 실패
- Vercel 환경변수가 올바른지 확인
- Supabase RLS 정책 확인
- Supabase 프로젝트가 활성 상태인지 확인

#### 2. 페이지 로딩 느림
- Supabase 무료 플랜은 콜드 스타트가 있을 수 있음
- 첫 접속 시 약간 느릴 수 있으나 정상

---

## 📊 배포 후 모니터링

### Vercel Analytics (선택사항)

1. Vercel 프로젝트 → "Analytics" 탭
2. 무료 플랜: 2,500 페이지뷰/월
3. 방문자 수, 페이지 성능 등 확인

### Vercel Logs

1. Vercel 프로젝트 → "Logs" 탭
2. 실시간 로그 확인
3. 에러 디버깅

---

## 🎉 완료!

축하합니다! 부부 가계부가 성공적으로 배포되었습니다!

### 다음 단계

1. **링크 공유**: 배포된 URL을 가족과 공유
2. **피드백 수집**: 실제 사용하면서 개선점 파악
3. **지속적인 개선**: Git push만으로 자동 업데이트

---

## 🆓 무료 플랜 한도

### Vercel 무료 플랜
- 100GB 대역폭/월
- 무제한 배포
- 자동 HTTPS
- 커스텀 도메인 지원

### Supabase 무료 플랜
- 500MB 데이터베이스
- 1GB 파일 스토리지
- 50,000 월간 활성 사용자
- 500MB 전송량/월

→ 개인/가족 사용에는 충분합니다!

---

## 📞 지원

문제가 발생하면:
1. Vercel 문서: https://vercel.com/docs
2. Supabase 문서: https://supabase.com/docs
3. GitHub Issues: 프로젝트 저장소


import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '🔴 Supabase 환경변수가 설정되지 않았습니다!\n\n' +
    '다음 단계를 진행하세요:\n' +
    '1. Supabase 프로젝트를 생성하세요 (https://supabase.com)\n' +
    '2. docs/빠른_시작_가이드.md 파일을 참고하세요\n' +
    '3. .env.local 파일을 생성하고 다음을 입력하세요:\n\n' +
    'NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n\n' +
    '⚠️ "your-supabase-url" 같은 임시값이 아닌 실제 값을 입력하세요!\n' +
    '4. 개발 서버를 재시작하세요 (npm run dev)'
  );
}

// URL 형식 검증
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  throw new Error(
    '🔴 잘못된 Supabase URL 형식입니다!\n\n' +
    `현재 입력된 값: "${supabaseUrl}"\n\n` +
    '올바른 형식:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co\n\n' +
    '✅ 실제 Supabase URL을 입력하세요:\n' +
    '1. https://supabase.com 에서 프로젝트 생성\n' +
    '2. Settings → API에서 "Project URL" 복사\n' +
    '3. .env.local 파일에 https://로 시작하는 전체 URL 입력\n' +
    '4. 따옴표 없이, 공백 없이 입력하세요!'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});


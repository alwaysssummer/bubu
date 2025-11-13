'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const FIXED_HOUSEHOLD_ID = 'my-household';

export default function HomePage() {
  const router = useRouter();
  const [status, setStatus] = useState('가계부 확인 중...');
  
  useEffect(() => {
    initializeHousehold();
  }, []);

  const initializeHousehold = async () => {
    try {
      // 1. 먼저 해당 ID의 가계부가 있는지 확인
      setStatus('가계부 확인 중...');
      const { data: existing, error: checkError } = await supabase
        .from('household')
        .select('id')
        .eq('id', FIXED_HOUSEHOLD_ID)
        .single();

      // 가계부가 이미 존재하면 바로 이동
      if (existing) {
        setStatus('가계부로 이동 중...');
        router.replace(`/${FIXED_HOUSEHOLD_ID}`);
        return;
      }

      // 2. 가계부가 없으면 생성
      setStatus('가계부 생성 중...');
      const { error: insertError } = await supabase
        .from('household')
        .insert([
          {
            id: FIXED_HOUSEHOLD_ID,
            person1_name: '남편',
            person2_name: '아내',
          },
        ]);

      if (insertError) {
        console.error('❌ 가계부 생성 오류:', insertError);
        setStatus('오류가 발생했습니다. 새로고침 해주세요.');
        return;
      }

      // 3. 생성 완료 후 이동
      setStatus('가계부로 이동 중...');
      router.replace(`/${FIXED_HOUSEHOLD_ID}`);
    } catch (error) {
      console.error('❌ 초기화 오류:', error);
      setStatus('오류가 발생했습니다. 새로고침 해주세요.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}

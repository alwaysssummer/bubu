'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function TestConnectionPage() {
  const params = useParams();
  const householdId = params.householdId as string;
  const [results, setResults] = useState<any[]>([]);

  const addResult = (test: string, status: 'success' | 'error', message: string, data?: any) => {
    setResults((prev) => [...prev, { test, status, message, data, timestamp: new Date() }]);
  };

  const runTests = async () => {
    setResults([]);
    
    // Test 1: Supabase 연결
    try {
      addResult('Supabase 연결', 'success', 'Supabase 클라이언트 초기화 성공');
    } catch (error) {
      addResult('Supabase 연결', 'error', `초기화 실패: ${error}`);
      return;
    }

    // Test 2: household 테이블 조회
    try {
      const { data, error } = await supabase.from('household').select('*').limit(1);
      if (error) {
        addResult('household 테이블', 'error', `에러: ${error.message || JSON.stringify(error)}`, error);
      } else {
        addResult('household 테이블', 'success', `조회 성공 (${data?.length || 0}개 레코드)`, data);
      }
    } catch (error: any) {
      addResult('household 테이블', 'error', `예외 발생: ${error.message || JSON.stringify(error)}`);
    }

    // Test 3: transactions 테이블 조회
    try {
      const { data, error } = await supabase.from('transactions').select('*').limit(1);
      if (error) {
        addResult('transactions 테이블', 'error', `에러: ${error.message || JSON.stringify(error)}`, error);
      } else {
        addResult('transactions 테이블', 'success', `조회 성공 (${data?.length || 0}개 레코드)`, data);
      }
    } catch (error: any) {
      addResult('transactions 테이블', 'error', `예외 발생: ${error.message || JSON.stringify(error)}`);
    }

    // Test 4: budget_items 테이블 조회
    try {
      const { data, error } = await supabase.from('budget_items').select('*').limit(1);
      if (error) {
        addResult('budget_items 테이블', 'error', `에러: ${error.message || JSON.stringify(error)}`, error);
      } else {
        addResult('budget_items 테이블', 'success', `조회 성공 (${data?.length || 0}개 레코드)`, data);
      }
    } catch (error: any) {
      addResult('budget_items 테이블', 'error', `예외 발생: ${error.message || JSON.stringify(error)}`);
    }

    // Test 5: todos 테이블 조회
    try {
      const { data, error } = await supabase.from('todos').select('*').limit(1);
      if (error) {
        addResult('todos 테이블', 'error', `에러: ${error.message || JSON.stringify(error)}`, error);
      } else {
        addResult('todos 테이블', 'success', `조회 성공 (${data?.length || 0}개 레코드)`, data);
      }
    } catch (error: any) {
      addResult('todos 테이블', 'error', `예외 발생: ${error.message || JSON.stringify(error)}`);
    }

    // Test 6: 현재 household 조회
    try {
      const { data, error } = await supabase
        .from('household')
        .select('*')
        .eq('id', householdId)
        .single();
      
      if (error) {
        addResult('현재 가계부 조회', 'error', `에러: ${error.message || JSON.stringify(error)}`, error);
      } else {
        addResult('현재 가계부 조회', 'success', `가계부 존재 확인`, data);
      }
    } catch (error: any) {
      addResult('현재 가계부 조회', 'error', `예외 발생: ${error.message || JSON.stringify(error)}`);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Supabase 연결 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runTests}>테스트 재실행</Button>
            <Button variant="outline" onClick={() => window.location.href = `/${householdId}`}>
              가계부로 돌아가기
            </Button>
          </div>

          <div className="space-y-2">
            {results.length === 0 ? (
              <p className="text-muted-foreground">테스트 실행 중...</p>
            ) : (
              results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                      : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {result.status === 'success' ? '✅' : '❌'}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-bold">{result.test}</h3>
                      <p className="text-sm">{result.message}</p>
                      {result.data && (
                        <pre className="mt-2 text-xs bg-black/10 dark:bg-white/10 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-bold mb-2">📋 다음 단계:</h3>
            <ul className="space-y-1 text-sm">
              <li>✅ 모든 테스트 성공 → 가계부 정상 작동</li>
              <li>❌ "does not exist" 에러 → SQL 스크립트 실행 필요</li>
              <li>❌ "permission denied" 에러 → RLS 정책 확인 필요</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



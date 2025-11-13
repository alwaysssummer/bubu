'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [person1Name, setPerson1Name] = useState('남편');
  const [person2Name, setPerson2Name] = useState('아내');
  const [existingId, setExistingId] = useState('');

  const createNewHousehold = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('household')
        .insert([
          {
            person1_name: person1Name,
            person2_name: person2Name,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('새 가계부가 생성되었습니다!');
      router.push(`/${data.id}`);
    } catch (error) {
      console.error('Error creating household:', error);
      toast.error('가계부 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const openExistingHousehold = () => {
    if (!existingId.trim()) {
      toast.error('가계부 ID를 입력해주세요.');
      return;
    }
    router.push(`/${existingId.trim()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">💰 부부 가계부</h1>
          <p className="text-muted-foreground">
            링크 하나로 간단하게 공유하는 가계부
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>새 가계부 시작하기</CardTitle>
            <CardDescription>
              새 가계부를 만들고 링크를 공유하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="person1">첫 번째 사람</Label>
                <Input
                  id="person1"
                  value={person1Name}
                  onChange={(e) => setPerson1Name(e.target.value)}
                  placeholder="남편"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="person2">두 번째 사람</Label>
                <Input
                  id="person2"
                  value={person2Name}
                  onChange={(e) => setPerson2Name(e.target.value)}
                  placeholder="아내"
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={createNewHousehold}
              disabled={loading}
            >
              {loading ? '생성 중...' : '새 가계부 만들기'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>기존 가계부 열기</CardTitle>
            <CardDescription>
              공유받은 가계부 ID를 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="existingId">가계부 ID</Label>
              <Input
                id="existingId"
                value={existingId}
                onChange={(e) => setExistingId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <Button
              className="w-full"
              variant="secondary"
              onClick={openExistingHousehold}
            >
              가계부 열기
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>인증 없이 링크만으로 공유됩니다</p>
          <p className="mt-1">링크를 아는 사람은 누구나 접근 가능합니다</p>
        </div>
      </div>
    </div>
  );
}

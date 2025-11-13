'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '@/lib/supabase';

interface MonthlyChartProps {
  householdId: string;
  currentMonth: string;
}

interface MonthlyData {
  month: string;
  수익: number;
  지출: number;
}

export function MonthlyChart({ householdId, currentMonth }: MonthlyChartProps) {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyData();
  }, [householdId, currentMonth]);

  async function fetchMonthlyData() {
    try {
      // 현재 달 기준 최근 6개월 계산
      const [year, month] = currentMonth.split('-').map(Number);
      const months: string[] = [];
      
      for (let i = 5; i >= 0; i--) {
        let targetMonth = month - i;
        let targetYear = year;
        
        while (targetMonth <= 0) {
          targetMonth += 12;
          targetYear -= 1;
        }
        
        months.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}`);
      }

      // 각 월별 데이터 조회
      const monthlyData: MonthlyData[] = [];

      for (const targetMonth of months) {
        const [y, m] = targetMonth.split('-').map(Number);
        const lastDay = new Date(y, m, 0).getDate();
        const startDate = `${targetMonth}-01`;
        const endDate = `${targetMonth}-${String(lastDay).padStart(2, '0')}`;

        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('household_id', householdId)
          .gte('date', startDate)
          .lte('date', endDate);

        if (error) throw error;

        const income = transactions
          ?.filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0) || 0;

        const expense = transactions
          ?.filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0) || 0;

        monthlyData.push({
          month: `${m}월`,
          수익: income,
          지출: expense,
        });
      }

      setData(monthlyData);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>월별 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 통계 (최근 6개월)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              label={{ value: '만원', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: number) => `${value.toLocaleString()} 만원`}
            />
            <Legend />
            <Bar dataKey="수익" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="지출" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


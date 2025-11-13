'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';

interface CategoryAnalysisProps {
  householdId: string;
  currentMonth: string;
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

const COLORS = [
  'hsl(0 84% 60%)',
  'hsl(25 95% 53%)',
  'hsl(48 96% 53%)',
  'hsl(142 76% 36%)',
  'hsl(217 91% 60%)',
  'hsl(271 91% 65%)',
  'hsl(329 86% 70%)',
];

export function CategoryAnalysis({ householdId, currentMonth }: CategoryAnalysisProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    fetchCategoryData();
  }, [householdId, currentMonth]);

  async function fetchCategoryData() {
    try {
      const [year, month] = currentMonth.split('-').map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      const startDate = `${currentMonth}-01`;
      const endDate = `${currentMonth}-${String(lastDay).padStart(2, '0')}`;

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('household_id', householdId)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      if (!transactions || transactions.length === 0) {
        setCategories([]);
        setTotalExpense(0);
        return;
      }

      // 카테고리별 합계 계산
      const categoryMap = new Map<string, number>();
      transactions.forEach((t) => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

      // 총 지출 계산
      const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
      setTotalExpense(total);

      // 비율 계산 및 정렬
      const categoryData: CategoryData[] = Array.from(categoryMap.entries())
        .map(([category, amount], index) => ({
          category,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
          color: COLORS[index % COLORS.length],
        }))
        .sort((a, b) => b.amount - a.amount);

      setCategories(categoryData);
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 지출</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 지출</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            이번 달 지출 내역이 없습니다
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          카테고리별 지출
          <span className="text-sm font-normal text-muted-foreground ml-2">
            (총 {totalExpense.toLocaleString()} 만원)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {category.amount.toLocaleString()} 만원
                  </span>
                  <span className="font-bold">
                    {category.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress value={category.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


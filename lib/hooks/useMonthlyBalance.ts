import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Transaction } from '@/lib/types';

export function useMonthlyBalance(householdId: string, month: string, transactions: Transaction[]) {
  const [openingBalance, setOpeningBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpeningBalance();
  }, [householdId, month]);

  async function fetchOpeningBalance() {
    try {
      // 이전 달의 마감 잔액 조회
      const [year, monthNum] = month.split('-').map(Number);
      const prevMonth = monthNum === 1 
        ? `${year - 1}-12` 
        : `${year}-${String(monthNum - 1).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('monthly_balances')
        .select('closing_balance')
        .eq('household_id', householdId)
        .eq('month', prevMonth)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116은 "no rows returned" 에러 (정상)
        console.error('❌ Supabase Error:', error);
        throw error;
      }

      setOpeningBalance(data?.closing_balance || 0);
    } catch (error) {
      console.error('❌ Error fetching opening balance:', error);
      setOpeningBalance(0);
    } finally {
      setLoading(false);
    }
  }

  // 현재 달 수익/지출 계산
  const monthlyIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // 현재 잔액 = 이월 잔액 + 수익 - 지출
  const closingBalance = openingBalance + monthlyIncome - monthlyExpense;

  return {
    openingBalance,
    monthlyIncome,
    monthlyExpense,
    closingBalance,
    loading,
  };
}


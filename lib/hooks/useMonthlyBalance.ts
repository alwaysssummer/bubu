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
      // 현재 달의 첫 날 (이전 모든 거래 조회용)
      const currentMonthStart = `${month}-01`;

      // 현재 달 이전의 모든 거래 내역 조회
      const { data: prevTransactions, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('household_id', householdId)
        .lt('date', currentMonthStart);

      if (error) {
        console.error('❌ Supabase Error:', error);
        throw error;
      }

      // 이전 모든 거래의 누적 잔액 계산
      const balance = (prevTransactions || []).reduce((sum, t) => {
        return t.type === 'income' ? sum + t.amount : sum - t.amount;
      }, 0);

      setOpeningBalance(balance);
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


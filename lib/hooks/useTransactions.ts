import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';

export function useTransactions(householdId: string, month: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();

    // Realtime subscription
    const channel = supabase
      .channel(`transactions:${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `household_id=eq.${householdId}`,
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId, month]);

  async function fetchTransactions() {
    try {
      // 해당 월의 첫날과 마지막 날 계산
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = `${month}-01`;
      
      // 다음 달의 0일 = 이번 달의 마지막 날
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

      console.log('🔍 Fetching transactions for:', { householdId, month, startDate, endDate });

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('household_id', householdId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase Error:', error.message);
        throw error;
      }
      
      console.log('✅ Transactions fetched:', data?.length || 0);
      setTransactions(data || []);
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  return { transactions, loading, refetch: fetchTransactions };
}


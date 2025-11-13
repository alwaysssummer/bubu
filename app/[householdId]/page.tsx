'use client';

import { useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useMonthlyBalance } from '@/lib/hooks/useMonthlyBalance';
import { TransactionDialog } from '@/components/TransactionDialog';
import { MonthlyChart } from '@/components/MonthlyChart';
import { CategoryAnalysis } from '@/components/CategoryAnalysis';
import {
  BalanceSkeleton,
  TransactionsSkeleton,
  ChartSkeleton,
  CategorySkeleton,
} from '@/components/LoadingSkeletons';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Transaction } from '@/lib/types';

export default function HouseholdPage() {
  const params = useParams();
  const householdId = params.householdId as string;

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  const { transactions, loading, refetch } = useTransactions(householdId, currentMonth);
  const balance = useMonthlyBalance(householdId, currentMonth, transactions);

  const goToPrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    setCurrentMonth(`${prevYear}-${String(prevMonth).padStart(2, '0')}`);
  };

  const goToNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    setCurrentMonth(`${nextYear}-${String(nextMonth).padStart(2, '0')}`);
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setDialogOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setActionMenuOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 거래를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('거래가 삭제되었습니다.');
      // 즉시 목록 새로고침
      refetch();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('거래 삭제에 실패했습니다.');
    }
  };

  if (loading || balance.loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" disabled>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <Button variant="ghost" size="icon" disabled>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <BalanceSkeleton />
        <TransactionsSkeleton />
        <ChartSkeleton />
        <CategorySkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Month Navigation + Balance Card */}
      <Card>
        <CardContent className="px-3 py-0.5">
          <div className="flex items-center justify-between gap-4">
            {/* 좌측: 월 네비게이션 */}
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={goToPrevMonth}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <span className="text-base font-semibold text-muted-foreground min-w-[70px] text-center">
                {format(new Date(currentMonth + '-01'), 'yyyy.MM', { locale: ko })}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            {/* 우측: 잔액 정보 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">
                  {balance.openingBalance.toLocaleString()}
                </span>
                <span className="text-income font-medium">
                  +{balance.monthlyIncome.toLocaleString()}
                </span>
                <span className="text-expense font-medium">
                  -{balance.monthlyExpense.toLocaleString()}
                </span>
              </div>
              <span className="text-4xl font-bold text-blue-600">
                {balance.closingBalance.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="pt-0">
        <CardContent className="p-0 pt-0">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              거래 내역이 없습니다
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[20%]" />
                  <col className="w-[35%]" />
                  <col className="w-[22.5%]" />
                  <col className="w-[22.5%]" />
                </colgroup>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      onClick={() => handleRowClick(transaction)}
                      className="border-b hover:bg-muted/50 active:bg-muted transition-colors cursor-pointer"
                    >
                      {/* 날짜 */}
                      <td className="py-1.5 pl-3 pr-2 whitespace-nowrap">
                        <span className="text-sm font-medium">
                          {format(new Date(transaction.date), 'd')}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({format(new Date(transaction.date), 'E', { locale: ko })})
                        </span>
                      </td>
                      
                      {/* 항목 */}
                      <td className="py-1.5 px-2">
                        <span className="text-sm font-medium">{transaction.category}</span>
                      </td>
                      
                      {/* 수익 */}
                      <td className="py-1.5 px-2 text-center">
                        {transaction.type === 'income' ? (
                          <span className="text-base font-bold text-income">
                            +{transaction.amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      
                      {/* 지출 */}
                      <td className="py-1.5 px-2 text-center">
                        {transaction.type === 'expense' ? (
                          <span className="text-base font-bold text-expense">
                            {transaction.amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Suspense fallback={<ChartSkeleton />}>
        <MonthlyChart householdId={householdId} currentMonth={currentMonth} />
      </Suspense>
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryAnalysis householdId={householdId} currentMonth={currentMonth} />
      </Suspense>

      {/* Floating Add Button */}
      <Button
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={handleAddNew}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Transaction Dialog */}
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        householdId={householdId}
        transaction={editingTransaction}
        defaultMonth={currentMonth}
      />

      {/* Action Menu Dialog */}
      <Dialog open={actionMenuOpen} onOpenChange={setActionMenuOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTransaction?.category}</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.type === 'income' ? '수익' : '지출'} ·{' '}
              {selectedTransaction?.amount.toLocaleString()} 만원
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-3 py-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">날짜</span>
                  <span>{format(new Date(selectedTransaction.date), 'yyyy년 M월 d일', { locale: ko })}</span>
                </div>
                {selectedTransaction.memo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">메모</span>
                    <span>{selectedTransaction.memo}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setActionMenuOpen(false);
                    handleEdit(selectedTransaction);
                  }}
                >
                  수정하기
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setActionMenuOpen(false);
                    handleDelete(selectedTransaction.id);
                  }}
                >
                  삭제하기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



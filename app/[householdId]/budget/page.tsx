'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Repeat, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { BudgetItem } from '@/lib/types';
import { BudgetItemDialog } from '@/components/BudgetItemDialog';

export default function BudgetPage() {
  const params = useParams();
  const householdId = params.householdId as string;

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  useEffect(() => {
    fetchBudgetItems();

    // Realtime subscription
    const channel = supabase
      .channel(`budget_items:${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_items',
          filter: `household_id=eq.${householdId}`,
        },
        () => {
          fetchBudgetItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId, currentMonth]);

  async function fetchBudgetItems() {
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .select('*')
        .eq('household_id', householdId)
        .eq('month', currentMonth)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBudgetItems(data || []);
    } catch (error) {
      console.error('Error fetching budget items:', error);
    } finally {
      setLoading(false);
    }
  }

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

  const handleToggleCheck = async (item: BudgetItem) => {
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('budget_items')
        .update({ is_checked: !item.is_checked })
        .eq('id', item.id);

      if (error) throw error;
      // 즉시 목록 새로고침
      fetchBudgetItems();
    } catch (error) {
      console.error('Error toggling check:', error);
      toast.error('체크 변경에 실패했습니다.');
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 항목을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('항목이 삭제되었습니다.');
      // 즉시 목록 새로고침
      fetchBudgetItems();
    } catch (error) {
      console.error('Error deleting budget item:', error);
      toast.error('항목 삭제에 실패했습니다.');
    }
  };

  // Calculate expected balance
  const incomeItems = budgetItems
    .filter((item) => item.type === 'income')
    .sort((a, b) => {
      // 마감일 없는 항목을 맨 앞으로
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return -1;
      if (!b.due_date) return 1;
      // 마감일 빠른 순서로
      return a.due_date - b.due_date;
    });
  
  const expenseItems = budgetItems
    .filter((item) => item.type === 'expense')
    .sort((a, b) => {
      // 마감일 없는 항목을 맨 앞으로
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return -1;
      if (!b.due_date) return 1;
      // 마감일 빠른 순서로
      return a.due_date - b.due_date;
    });

  // 전체 금액 (체크 여부 무관)
  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  // 체크된 항목 금액
  const checkedIncome = incomeItems
    .filter((item) => item.is_checked)
    .reduce((sum, item) => sum + item.amount, 0);

  const checkedExpense = expenseItems
    .filter((item) => item.is_checked)
    .reduce((sum, item) => sum + item.amount, 0);

  const expectedBalance = checkedIncome - checkedExpense;

  // 차액 계산
  const incomeDiff = totalIncome - checkedIncome;
  const expenseDiff = totalExpense - checkedExpense;

  const handleRowClick = (item: BudgetItem) => {
    setSelectedItem(item);
    setActionMenuOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Month Navigation + Expected Balance */}
      <Card>
        <CardContent className="px-3 py-1">
          <div className="flex items-center justify-between gap-6">
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

            {/* 우측: 차액 표시만 */}
            <div className="flex flex-col gap-1 text-base">
              <div className="text-income">
                <span className="font-bold text-foreground">{totalIncome}</span>
                <span className="text-muted-foreground"> - </span>
                <span className="font-medium">{checkedIncome}</span>
                <span className="text-muted-foreground"> = </span>
                <span className="font-bold">{incomeDiff}</span>
              </div>
              <div className="text-expense">
                <span className="font-bold text-foreground">{totalExpense}</span>
                <span className="text-muted-foreground"> - </span>
                <span className="font-medium">{checkedExpense}</span>
                <span className="text-muted-foreground"> = </span>
                <span className="font-bold">{expenseDiff}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Items Table */}
      <Card className="pt-0">
        <CardContent className="p-0 pt-0">
          {budgetItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              예산 항목이 없습니다
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[7%]" />
                  <col className="w-[28%]" />
                  <col className="w-[14%]" />
                  <col className="w-[2%]" />
                  <col className="w-[7%]" />
                  <col className="w-[28%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <tbody>
                  {Array.from({ 
                    length: Math.max(incomeItems.length, expenseItems.length) 
                  }).map((_, index) => {
                    const incomeItem = incomeItems[index];
                    const expenseItem = expenseItems[index];
                    
                    return (
                      <tr key={index} className="border-b">
                        {/* 수익 영역 */}
                        {incomeItem ? (
                          <>
                            {/* 수익 체크박스 */}
                            <td 
                              className="py-1.5 pl-2 pr-0.5 text-center hover:bg-muted/50 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCheck(incomeItem);
                              }}
                            >
                              <Checkbox
                                checked={incomeItem.is_checked}
                                onCheckedChange={() => handleToggleCheck(incomeItem)}
                              />
                            </td>
                            
                            {/* 수익 항목명 */}
                            <td 
                              className="py-1.5 px-0.5 hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => handleRowClick(incomeItem)}
                            >
                              <div className="flex items-center gap-0.5 overflow-hidden">
                                {incomeItem.due_date && (
                                  <span className="text-[9px] text-muted-foreground flex-shrink-0">
                                    ({incomeItem.due_date})
                                  </span>
                                )}
                                <span className="text-xs font-medium truncate">{incomeItem.title}</span>
                                {incomeItem.is_recurring && (
                                  <Repeat className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                            </td>
                            
                            {/* 수익 금액 */}
                            <td 
                              className="py-1.5 px-0.5 text-center hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => handleRowClick(incomeItem)}
                            >
                              <span className="text-sm font-bold text-income">
                                {incomeItem.amount.toLocaleString()}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-1.5 px-1"></td>
                            <td className="py-1.5 px-1"></td>
                            <td className="py-1.5 px-1"></td>
                          </>
                        )}
                        
                        {/* 중앙 구분선 */}
                        <td className="py-1.5 px-0 border-r border-muted"></td>
                        
                        {/* 지출 영역 */}
                        {expenseItem ? (
                          <>
                            {/* 지출 체크박스 */}
                            <td 
                              className="py-1.5 pl-0.5 pr-0.5 text-center hover:bg-muted/50 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCheck(expenseItem);
                              }}
                            >
                              <Checkbox
                                checked={expenseItem.is_checked}
                                onCheckedChange={() => handleToggleCheck(expenseItem)}
                              />
                            </td>
                            
                            {/* 지출 항목명 */}
                            <td 
                              className="py-1.5 px-0.5 hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => handleRowClick(expenseItem)}
                            >
                              <div className="flex items-center gap-0.5 overflow-hidden">
                                {expenseItem.due_date && (
                                  <span className="text-[9px] text-muted-foreground flex-shrink-0">
                                    ({expenseItem.due_date})
                                  </span>
                                )}
                                <span className="text-xs font-medium truncate">{expenseItem.title}</span>
                                {expenseItem.is_recurring && (
                                  <Repeat className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                            </td>
                            
                            {/* 지출 금액 */}
                            <td 
                              className="py-1.5 pr-2 pl-0.5 text-center hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => handleRowClick(expenseItem)}
                            >
                              <span className="text-sm font-bold text-expense">
                                {expenseItem.amount.toLocaleString()}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-1.5 px-0 border-r border-muted"></td>
                            <td className="py-1.5 px-1"></td>
                            <td className="py-1.5 px-1"></td>
                            <td className="py-1.5 px-1"></td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Add Button */}
      <Button
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={handleAddNew}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Budget Item Dialog */}
      <BudgetItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        householdId={householdId}
        budgetItem={editingItem}
        currentMonth={currentMonth}
      />

      {/* Action Menu Dialog */}
      <Dialog open={actionMenuOpen} onOpenChange={setActionMenuOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
            <DialogDescription>
              {selectedItem?.type === 'income' ? '수익' : '지출'} ·{' '}
              {selectedItem?.amount.toLocaleString()} 만원
              {selectedItem?.is_recurring && ' · 반복'}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setActionMenuOpen(false);
                  handleEdit(selectedItem);
                }}
              >
                수정하기
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  setActionMenuOpen(false);
                  handleDelete(selectedItem.id);
                }}
              >
                삭제하기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



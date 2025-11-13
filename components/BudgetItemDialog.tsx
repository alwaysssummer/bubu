'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { BudgetItem, TransactionType } from '@/lib/types';

interface BudgetItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: string;
  budgetItem?: BudgetItem | null;
  currentMonth: string;
}

export function BudgetItemDialog({
  open,
  onOpenChange,
  householdId,
  budgetItem,
  currentMonth,
}: BudgetItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (budgetItem) {
      setType(budgetItem.type);
      setTitle(budgetItem.title);
      setAmount(String(budgetItem.amount));
      setIsRecurring(budgetItem.is_recurring);
      setDueDate(budgetItem.due_date ? String(budgetItem.due_date) : '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setIsRecurring(false);
      setDueDate('');
    }
  }, [budgetItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !amount) {
      toast.error('제목과 금액을 입력해주세요.');
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('올바른 금액을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const dueDateNum = dueDate ? parseInt(dueDate) : null;
      
      const data = {
        household_id: householdId,
        type,
        title,
        amount: amountNum,
        is_recurring: isRecurring,
        is_checked: false,
        month: currentMonth,
        due_date: dueDateNum,
      };

      if (budgetItem) {
        // Update
        const { error } = await supabase
          .from('budget_items')
          .update(data)
          .eq('id', budgetItem.id);

        if (error) throw error;
        toast.success('예산 항목이 수정되었습니다.');
      } else {
        // Insert
        const { error } = await supabase.from('budget_items').insert([data]);

        if (error) throw error;
        toast.success('예산 항목이 추가되었습니다.');
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error('❌ Error saving budget item:', JSON.stringify(error, null, 2));
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      if (error?.message) {
        toast.error(`저장 실패: ${error.message}`);
      } else {
        toast.error('저장에 실패했습니다. 콘솔을 확인해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {budgetItem ? '예산 항목 수정' : '예산 항목 추가'}
          </DialogTitle>
          <DialogDescription>
            매월 반복되는 수익/지출 항목을 관리하세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="space-y-2">
            <Label>구분</Label>
            <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="income">수익</TabsTrigger>
                <TabsTrigger value="expense">지출</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 월급, 월세, 통신비"
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">금액</Label>
            <div className="flex items-center gap-2">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10"
                min="1"
                required
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                만원
              </span>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">마감일 (선택)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="dueDate"
                type="number"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="일"
                min="1"
                max="31"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                일
              </span>
            </div>
          </div>

          {/* Is Recurring */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
            />
            <Label
              htmlFor="recurring"
              className="text-sm font-normal cursor-pointer"
            >
              매월 반복 (다음 달에 자동으로 복사됩니다)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? '저장 중...' : budgetItem ? '수정하기' : '추가하기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}



'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Transaction, TransactionType } from '@/lib/types';
import { CategoryCombobox } from './CategoryCombobox';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: string;
  transaction?: Transaction | null;
  defaultMonth: string;
}

export function TransactionDialog({
  open,
  onOpenChange,
  householdId,
  transaction,
  defaultMonth,
}: TransactionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [memo, setMemo] = useState('');

  // Load transaction data when editing
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setDate(new Date(transaction.date));
      setMemo(transaction.memo || '');
    } else {
      // Reset form
      setType('expense');
      setAmount('');
      setCategory('');
      setDate(new Date());
      setMemo('');
    }
  }, [transaction, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category) {
      toast.error('금액과 항목을 입력해주세요.');
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('올바른 금액을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const data = {
        household_id: householdId,
        type,
        amount: amountNum,
        category,
        person: '공통',
        date: format(date, 'yyyy-MM-dd'),
        memo: memo || null,
      };

      if (transaction) {
        // Update
        const { error } = await supabase
          .from('transactions')
          .update(data)
          .eq('id', transaction.id);

        if (error) throw error;
        toast.success('거래가 수정되었습니다.');
      } else {
        // Insert
        const { error } = await supabase.from('transactions').insert([data]);

        if (error) throw error;
        toast.success('거래가 추가되었습니다.');
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? '거래 수정' : '거래 추가'}
          </DialogTitle>
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

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">항목</Label>
            <CategoryCombobox
              householdId={householdId}
              value={category}
              onChange={setCategory}
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

          {/* Date */}
          <div className="space-y-2">
            <Label>날짜</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'yyyy년 M월 d일', { locale: ko })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Memo */}
          <div className="space-y-2">
            <Label htmlFor="memo">메모 (선택)</Label>
            <Input
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="간단한 메모"
            />
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
              {loading ? '저장 중...' : transaction ? '수정하기' : '추가하기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}



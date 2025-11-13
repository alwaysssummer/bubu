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
import type { Todo } from '@/lib/types';

interface TodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: string;
  todo?: Todo | null;
}

export function TodoDialog({
  open,
  onOpenChange,
  householdId,
  todo,
}: TodoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDueDate(new Date(todo.due_date));
      setMemo(todo.memo || '');
    } else {
      setTitle('');
      setDueDate(undefined);
      setMemo('');
    }
  }, [todo, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const data = {
        household_id: householdId,
        title,
        requester: '공통',
        assignee: '공통',
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        is_completed: false,
        memo: memo || null,
        completed_at: null,
      };

      if (todo) {
        // Update
        const { error } = await supabase
          .from('todos')
          .update(data)
          .eq('id', todo.id);

        if (error) throw error;
        toast.success('할일이 수정되었습니다.');
      } else {
        // Insert
        const { error } = await supabase.from('todos').insert([data]);

        if (error) throw error;
        toast.success('할일이 추가되었습니다.');
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving todo:', error);
      toast.error('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{todo ? '할일 수정' : '할일 추가'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="할일 입력"
              required
              autoFocus
            />
          </div>

          {/* Due Date & Memo - 수정시에만 표시 */}
          {todo && (
            <>
              <div className="space-y-2">
                <Label>마감일</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate && format(dueDate, 'yyyy년 M월 d일', { locale: ko })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(d) => d && setDueDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo">메모 (선택)</Label>
                <Input
                  id="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="메모 입력"
                />
              </div>
            </>
          )}

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
              {loading ? '저장 중...' : todo ? '수정하기' : '추가하기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}



'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Todo } from '@/lib/types';
import { TodoDialog } from '@/components/TodoDialog';

export default function TodosPage() {
  const params = useParams();
  const householdId = params.householdId as string;

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  useEffect(() => {
    fetchTodos();

    // Realtime subscription
    const channel = supabase
      .channel(`todos:${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `household_id=eq.${householdId}`,
        },
        () => {
          fetchTodos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId]);

  async function fetchTodos() {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('household_id', householdId)
        .order('is_completed', { ascending: true })
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setDialogOpen(true);
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({
          is_completed: !todo.is_completed,
          completed_at: !todo.is_completed ? new Date().toISOString() : null,
        })
        .eq('id', todo.id);

      if (error) throw error;
      toast.success(todo.is_completed ? '할일이 다시 활성화되었습니다.' : '할일이 완료되었습니다.');
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast.error('처리에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 할일을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);

      if (error) throw error;
      toast.success('할일이 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('할일 삭제에 실패했습니다.');
    }
  };

  const addQuickTodo = async () => {
    if (!newTodoTitle.trim()) return;

    try {
      const data = {
        household_id: householdId,
        title: newTodoTitle.trim(),
        requester: '공통',
        assignee: '공통',
        due_date: format(new Date(), 'yyyy-MM-dd'),
        is_completed: false,
        memo: null,
        completed_at: null,
      };

      const { error } = await supabase.from('todos').insert([data]);

      if (error) throw error;
      toast.success('할일이 추가되었습니다.');
      setNewTodoTitle('');
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('할일 추가에 실패했습니다.');
    }
  };

  const handleQuickAdd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    await addQuickTodo();
  };

  const pendingTodos = todos.filter((t) => !t.is_completed);
  const completedTodos = todos.filter((t) => t.is_completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  const renderTodo = (todo: Todo) => {
    const dueDate = new Date(todo.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateNormalized = new Date(dueDate);
    dueDateNormalized.setHours(0, 0, 0, 0);
    
    const daysRemaining = differenceInDays(dueDateNormalized, today);
    const isOverdue = daysRemaining < 0 && !todo.is_completed;
    
    let dateText = '';
    if (todo.is_completed) {
      if (todo.completed_at) {
        dateText = format(new Date(todo.completed_at), 'M/d 완료', { locale: ko });
      }
    } else {
      if (daysRemaining === 0) {
        dateText = '오늘 마감';
      } else if (daysRemaining > 0) {
        dateText = `D-${daysRemaining}`;
      } else {
        dateText = `D+${Math.abs(daysRemaining)}`;
      }
    }

    return (
      <div
        key={todo.id}
        className={`p-2 rounded border hover:bg-muted/50 transition-colors ${
          isOverdue ? 'border-destructive' : ''
        }`}
      >
        <div className="flex items-start gap-2">
          <button
            onClick={() => handleToggleComplete(todo)}
            className="mt-0.5"
          >
            {todo.is_completed ? (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <div className="flex-1 space-y-0.5">
            <h3
              className={`text-sm font-medium ${
                todo.is_completed ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {todo.title}
            </h3>
            <div className="text-xs text-muted-foreground">
              <span
                className={isOverdue ? 'text-destructive font-medium' : ''}
              >
                {dateText}
              </span>
              {todo.memo && (
                <span className="ml-2">· {todo.memo}</span>
              )}
            </div>
          </div>

          <div className="flex gap-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(todo)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <span className="text-base font-light">✎</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(todo.id)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            >
              <span className="text-lg font-light">×</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 p-2 border rounded-lg bg-card">
        <Input
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          onKeyDown={handleQuickAdd}
          placeholder="할일 입력"
          className="flex-1 border-0 focus-visible:ring-0 px-0 h-8 text-sm"
        />
        <Button
          size="icon"
          onClick={addQuickTodo}
          className="h-7 w-7 flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Todos List */}
      <Card>
        <CardContent className="p-2">
          {todos.length === 0 ? (
            <p className="text-center text-muted-foreground py-3 text-sm">
              할일이 없습니다
            </p>
          ) : (
            <div className="space-y-1.5">
              {pendingTodos.map(renderTodo)}
              {pendingTodos.length > 0 && completedTodos.length > 0 && (
                <div className="border-t border-muted" />
              )}
              {completedTodos.map(renderTodo)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Todo Dialog */}
      <TodoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        householdId={householdId}
        todo={editingTodo}
      />
    </div>
  );
}



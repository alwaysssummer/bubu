'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/lib/supabase';

interface CategoryComboboxProps {
  householdId: string;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
}

const DEFAULT_CATEGORIES = [
  '급여',
  '식비',
  '교통비',
  '월세',
  '통신비',
  '쇼핑',
  '의료',
  '공과금',
  '여가',
  '저축',
];

export function CategoryCombobox({
  householdId,
  value,
  onChange,
  onEnter,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [recentCategories, setRecentCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchRecentCategories();
  }, [householdId]);

  async function fetchRecentCategories() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('category')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get unique categories
      const unique = Array.from(
        new Set(data?.map((t) => t.category) || [])
      ).slice(0, 5);

      setRecentCategories(unique);
    } catch (error) {
      console.error('Error fetching recent categories:', error);
    }
  }

  const allCategories = [
    ...new Set([...recentCategories, ...DEFAULT_CATEGORIES]),
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || '항목 선택 또는 입력...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="항목 검색 또는 입력..."
            value={value}
            onValueChange={onChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value) {
                e.preventDefault();
                setOpen(false);
                onEnter?.();
              }
            }}
          />
          <CommandList>
            <CommandEmpty>
              <div className="text-sm text-muted-foreground p-2">
                Enter를 눌러 &quot;{value}&quot; 추가
              </div>
            </CommandEmpty>
            {recentCategories.length > 0 && (
              <CommandGroup heading="최근 사용">
                {recentCategories.map((category) => (
                  <CommandItem
                    key={`recent-${category}`}
                    value={category}
                    onSelect={(currentValue) => {
                      onChange(currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === category ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {category}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading="추천 항목">
              {DEFAULT_CATEGORIES.filter(
                (cat) => !recentCategories.includes(cat)
              ).map((category) => (
                <CommandItem
                  key={`default-${category}`}
                  value={category}
                  onSelect={(currentValue) => {
                    onChange(currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === category ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {category}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}



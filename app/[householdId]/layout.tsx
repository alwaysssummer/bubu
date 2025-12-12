'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Copy, Home, ListChecks, CheckSquare, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { TransactionDialog } from '@/components/TransactionDialog';
import type { TransactionType } from '@/lib/types';

export default function HouseholdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const householdId = params.householdId as string;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');

  const copyLink = async () => {
    const url = `${window.location.origin}/${householdId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('링크가 복사되었습니다!');
    } catch {
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  const handleQuickAdd = (type: TransactionType) => {
    setTransactionType(type);
    setDialogOpen(true);
  };

  // 현재 월 가져오기
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const tabs = [
    {
      name: '가계부',
      href: `/${householdId}`,
      icon: Home,
      isActive: pathname === `/${householdId}`,
    },
    {
      name: '예산',
      href: `/${householdId}/budget`,
      icon: ListChecks,
      isActive: pathname === `/${householdId}/budget`,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-16">
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 pt-4">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-8 h-16">
            <Link
              href={`/${householdId}`}
              className={`flex flex-col items-center justify-center transition-colors ${
                pathname === `/${householdId}`
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">가계부</span>
            </Link>

            {/* Center Quick Add Buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="default"
                className="h-12 w-12 rounded-full shadow-lg bg-green-600 hover:bg-green-700"
                onClick={() => handleQuickAdd('income')}
              >
                <Plus className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                variant="default"
                className="h-12 w-12 rounded-full shadow-lg bg-red-600 hover:bg-red-700"
                onClick={() => handleQuickAdd('expense')}
              >
                <Minus className="h-6 w-6" />
              </Button>
            </div>

            <Link
              href={`/${householdId}/budget`}
              className={`flex flex-col items-center justify-center transition-colors ${
                pathname === `/${householdId}/budget`
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListChecks className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">예산</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Transaction Dialog */}
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        householdId={householdId}
        transaction={null}
        defaultMonth={getCurrentMonth()}
        defaultType={transactionType}
      />
    </div>
  );
}



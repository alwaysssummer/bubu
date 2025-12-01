'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Copy, Home, ListChecks, CheckSquare, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function HouseholdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const householdId = params.householdId as string;

  const copyLink = async () => {
    const url = `${window.location.origin}/${householdId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('링크가 복사되었습니다!');
    } catch {
      toast.error('링크 복사에 실패했습니다.');
    }
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

            {/* Center Add Button - Will be handled by page */}
            <div className="w-12 h-12" />

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
    </div>
  );
}



'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Copy, Home, ListChecks, CheckSquare } from 'lucide-react';
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
    {
      name: '할일',
      href: `/${householdId}/todos`,
      icon: CheckSquare,
      isActive: pathname === `/${householdId}/todos`,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-16">
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 pt-4">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                    tab.isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}



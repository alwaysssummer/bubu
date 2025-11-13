import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BalanceSkeleton() {
  return (
    <Card>
      <CardContent className="px-3 py-0.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <Skeleton className="h-7 w-7" />
            <Skeleton className="h-5 w-18" />
            <Skeleton className="h-7 w-7" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-12 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TransactionsSkeleton() {
  return (
    <Card className="pt-0">
      <CardContent className="p-0 pt-0">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[35%]" />
              <col className="w-[22.5%]" />
              <col className="w-[22.5%]" />
            </colgroup>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b">
                  <td className="py-1.5 pl-3 pr-2">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="py-1.5 px-2">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

export function CategorySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


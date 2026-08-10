import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <PageContainer>
      <div aria-label="正在加载通知" aria-busy="true">
        <div className="space-y-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-6 w-full max-w-reading" />
        </div>
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-control w-28" />
          <Skeleton className="h-control w-28" />
        </div>
        <ul className="mt-8 border-y border-border-subtle">
          {Array.from({ length: 4 }, (_, index) => (
            <li
              key={index}
              className="space-y-3 border-b border-border-subtle px-4 py-4 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="size-2 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="ml-auto h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </li>
          ))}
        </ul>
      </div>
    </PageContainer>
  );
}

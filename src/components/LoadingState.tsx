import { Skeleton } from '@/components/ui/skeleton';

export function LoadingState() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Skeleton */}
        <div className="glass-card p-6">
          <div className="flex flex-col items-center">
            <Skeleton className="w-28 h-28 rounded-full" />
            <Skeleton className="h-6 w-32 mt-4" />
            <Skeleton className="h-4 w-24 mt-2" />
            <Skeleton className="h-16 w-full mt-4" />
            <div className="grid grid-cols-3 gap-3 w-full mt-6">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Repos Skeleton */}
        <div className="lg:col-span-2 glass-card p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

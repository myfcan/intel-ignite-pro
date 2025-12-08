import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      {/* Gamification Header Skeleton */}
      <div className="bg-white/80 border-b border-border px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section Skeleton */}
        <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 p-8 mb-6">
          <Skeleton className="h-4 w-32 mb-3 bg-white/30" />
          <Skeleton className="h-10 w-64 mb-2 bg-white/30" />
          <Skeleton className="h-5 w-80 bg-white/30" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trails Section Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-7 w-32 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full rounded-full mb-3" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Missions Skeleton */}
        <div className="bg-white rounded-xl border border-border p-5">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

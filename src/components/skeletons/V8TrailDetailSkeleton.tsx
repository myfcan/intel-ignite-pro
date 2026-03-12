import { Skeleton } from "@/components/ui/skeleton";

export const V8TrailDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-7 w-12 rounded-full" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-4 pb-8">
        {/* Trail Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Layout: Certificate + Journeys */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Certificate Card Skeleton */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:w-72 flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          {/* Journey Cards */}
          <div className="flex-1 min-w-0 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                style={{ opacity: 1 - i * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Skeleton className="h-2.5 w-14" />
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right space-y-1">
                      <Skeleton className="h-3 w-8 ml-auto" />
                      <Skeleton className="h-2.5 w-14" />
                    </div>
                    <Skeleton className="w-4 h-4 rounded" />
                  </div>
                </div>
                <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import { Skeleton } from "@/components/ui/skeleton";

export const TrailDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back Button Skeleton */}
        <Skeleton className="h-10 w-28 rounded-xl mb-6" />

        {/* Header Card Skeleton */}
        <div className="rounded-3xl bg-gradient-to-r from-primary/20 to-secondary/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            {/* Left Side */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <Skeleton className="h-16 w-16 rounded-2xl bg-white/30" />
                <div className="flex-1">
                  <Skeleton className="h-8 w-64 mb-2 bg-white/30" />
                  <Skeleton className="h-5 w-80 bg-white/30" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20 bg-white/30" />
                <Skeleton className="h-4 w-24 bg-white/30" />
              </div>
            </div>

            {/* Right Side - Progress */}
            <div className="bg-white/20 rounded-2xl p-5 text-center">
              <Skeleton className="h-4 w-24 mx-auto mb-2 bg-white/30" />
              <Skeleton className="h-12 w-20 mx-auto mb-1 bg-white/30" />
              <Skeleton className="h-4 w-16 mx-auto bg-white/30" />
            </div>
          </div>

          {/* Progress Bar */}
          <Skeleton className="h-3 w-full rounded-full mt-6 bg-white/30" />
        </div>

        {/* Lessons Section */}
        <Skeleton className="h-7 w-24 mb-6" />

        {/* Lesson Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <Skeleton className="h-20 w-20 rounded-xl flex-shrink-0" />

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div>
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>

                  {/* Status */}
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

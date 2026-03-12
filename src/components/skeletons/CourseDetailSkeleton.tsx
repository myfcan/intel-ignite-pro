import { Skeleton } from "@/components/ui/skeleton";

export const CourseDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">
        {/* Context Card — trail + title + description */}
        <div className="rounded-2xl bg-white border border-border p-5 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          {/* Progress bar */}
          <div className="pt-2 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        </div>

        {/* Certificate Card */}
        <div className="rounded-2xl bg-white border border-border p-5 flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>

        {/* Section Title */}
        <Skeleton className="h-6 w-20" />

        {/* Lesson Cards */}
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-border p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
              style={{ opacity: 1 - i * 0.08 }}
            >
              {/* Icon */}
              <Skeleton className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex-shrink-0" />

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-3/5" />
                  {i === 0 && <Skeleton className="h-5 w-16 rounded-full" />}
                </div>
                <Skeleton className="h-3 w-4/5" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

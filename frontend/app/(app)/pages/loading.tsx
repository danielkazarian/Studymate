import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedCard } from "@/components/ui/animated-card"

export default function PagesLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 bg-zinc-800" />
          <Skeleton className="h-4 w-96 bg-zinc-800 mt-2" />
        </div>
        <Skeleton className="h-10 w-32 bg-zinc-800" />
      </div>

      {/* Search and Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1 bg-zinc-800" />
        <Skeleton className="h-10 w-32 bg-zinc-800" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <AnimatedCard key={i} className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-20 bg-zinc-800 mb-2" />
                <Skeleton className="h-8 w-12 bg-zinc-800" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full bg-zinc-800" />
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Pages Grid Skeleton */}
      <div className="grid gap-6">
        {[...Array(3)].map((_, i) => (
          <AnimatedCard key={i} className="bg-zinc-900 border-zinc-800">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Skeleton className="h-6 w-64 bg-zinc-800" />
                    <Skeleton className="h-5 w-16 bg-zinc-800" />
                  </div>
                  <Skeleton className="h-4 w-full bg-zinc-800" />
                </div>
                <Skeleton className="h-8 w-8 bg-zinc-800" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-16 bg-zinc-800" />
                    <Skeleton className="h-4 w-8 bg-zinc-800" />
                  </div>
                  <Skeleton className="h-2 w-full bg-zinc-800" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-24 bg-zinc-800" />
                    <Skeleton className="h-4 w-28 bg-zinc-800" />
                  </div>
                  <Skeleton className="h-4 w-20 bg-zinc-800" />
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  )
}

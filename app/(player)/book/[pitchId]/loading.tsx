import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8" aria-busy aria-label="Loading times">
      <div className="space-y-2">
        <Skeleton className="h-5 w-24 rounded-lg" />
        <Skeleton className="h-9 w-56 rounded-xl" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[74px] w-[58px] shrink-0 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-14 w-full max-w-sm rounded-2xl" />
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

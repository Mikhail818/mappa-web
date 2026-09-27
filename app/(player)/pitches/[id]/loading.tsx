import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading pitch">
      <div className="space-y-2">
        <Skeleton className="h-5 w-20 rounded-lg" />
        <Skeleton className="h-9 w-64 rounded-xl" />
      </div>
      <Skeleton className="h-52 w-full rounded-3xl sm:h-64" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-5" aria-busy aria-label="Loading bookings">
      <Skeleton className="h-9 w-40 rounded-xl" />
      <Skeleton className="h-11 w-full rounded-2xl" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl bg-card p-3 shadow-soft ring-1 ring-foreground/[0.06]">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

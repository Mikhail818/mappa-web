import type { AvailabilityWindow } from "@/lib/booking/slots"
import { dayOfWeek, toDateKey } from "@/lib/utils/time"
import { cn } from "@/lib/utils"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const WEEK = [1, 2, 3, 4, 5, 6, 0]

export function OpeningHours({ availability, now = new Date() }: { availability: AvailabilityWindow[]; now?: Date }) {
  const today = dayOfWeek(toDateKey(now))
  const active = availability.filter((a) => a.is_active)
  if (!active.length) return null

  return (
    <dl className="divide-y divide-border/70">
      {WEEK.map((day) => {
        const windows = active
          .filter((a) => a.day_of_week === day)
          .sort((a, b) => a.opens_at.localeCompare(b.opens_at))
        const isToday = day === today
        return (
          <div key={day} className={cn("flex items-center justify-between py-2.5 text-sm", isToday && "font-semibold")}>
            <dt className={cn(!isToday && "text-muted-foreground")}>
              {DAYS[day]}
              {isToday && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">Today</span>}
            </dt>
            <dd className={cn("tabular-nums", !windows.length && "text-muted-foreground")}>
              {windows.length
                ? windows.map((w) => `${w.opens_at.slice(0, 5)}–${w.closes_at.slice(0, 5)}`).join(", ")
                : "Closed"}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}

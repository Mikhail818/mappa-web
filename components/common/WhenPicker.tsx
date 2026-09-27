"use client"

import { useMemo, useState } from "react"
import { addDays, dayOfWeek, formatClock, formatFullDate, minutesOfDay, toDateKey, zonedTime, type DateKey } from "@/lib/utils/time"
import { cn } from "@/lib/utils"

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface WhenPickerProps {
  value: Date | null
  onChange: (value: Date | null) => void
  days?: number
  /** First and last selectable start hour, in Cyprus time. */
  fromHour?: number
  toHour?: number
  /** Adds a "No time yet" choice for when a time is optional. */
  optional?: boolean
  label?: string
}

/** Day strip + hourly start times, always in Cyprus time. */
export function WhenPicker({ value, onChange, days = 14, fromHour = 7, toHour = 22, optional, label = "When" }: WhenPickerProps) {
  const [now] = useState(() => new Date())
  const today = toDateKey(now)
  const dates = useMemo(() => Array.from({ length: days }, (_, i) => addDays(today, i)), [today, days])
  const [date, setDate] = useState<DateKey>(value ? toDateKey(value) : today)

  const times = []
  for (let h = fromHour; h <= toHour; h++) {
    const at = zonedTime(date, h * 60)
    // Leave at least half an hour to organise anything.
    if (at.getTime() > now.getTime() + 30 * 60_000) times.push({ minutes: h * 60, at })
  }
  const selectedKey = value?.getTime()

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{value ? `${formatFullDate(value)}, ${formatClock(minutesOfDay(value))}` : optional ? "Flexible" : "Pick a time"}</p>
      </div>
      <div role="radiogroup" aria-label="Day" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none">
        {dates.map((d) => (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={d === date}
            onClick={() => setDate(d)}
            className={cn(
              "flex w-12 shrink-0 flex-col items-center rounded-xl py-1.5 transition-all active:scale-95",
              d === date ? "bg-foreground text-background" : "bg-muted/70 text-foreground",
            )}
          >
            <span className="text-[10px] font-medium uppercase opacity-70">{d === today ? "Today" : WEEKDAY_SHORT[dayOfWeek(d)]}</span>
            <span className="text-base font-semibold tabular-nums">{+d.slice(8)}</span>
          </button>
        ))}
      </div>
      {times.length === 0 ? (
        <p className="rounded-xl bg-muted/60 px-3 py-4 text-center text-sm text-muted-foreground">No more times today — pick another day.</p>
      ) : (
        <div role="radiogroup" aria-label="Start time" className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
          {times.map(({ minutes, at }) => {
            const active = selectedKey === at.getTime()
            return (
              <button
                key={minutes}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(active && optional ? null : at)}
                className={cn(
                  "h-10 rounded-xl text-sm font-semibold tabular-nums transition-all active:scale-95",
                  active ? "bg-primary text-primary-foreground shadow-soft" : "bg-card ring-1 ring-foreground/10 hover:ring-primary/50",
                )}
              >
                {formatClock(minutes)}
              </button>
            )
          })}
        </div>
      )}
      {optional && value && (
        <button type="button" onClick={() => onChange(null)} className="text-sm font-medium text-primary">
          Clear — agree a time later
        </button>
      )}
    </div>
  )
}


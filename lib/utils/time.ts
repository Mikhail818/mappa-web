// Time helpers pinned to the venues' time zone.
//
// All venues are in Cyprus, so opening hours ("18:00") are Cyprus wall-clock
// times. Rendering with the runtime's zone would show UTC times on the server
// and the wrong slots for visitors abroad, so every date shown or computed for
// a booking goes through these helpers instead.

export const VENUE_TZ = "Europe/Nicosia"

/** A calendar day in the venue zone, as "YYYY-MM-DD". */
export type DateKey = string

interface ZonedParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  weekday: number
}

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: VENUE_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  weekday: "short",
})

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function zonedParts(date: Date): ZonedParts {
  const map: Record<string, string> = {}
  for (const p of partsFormatter.formatToParts(date)) map[p.type] = p.value
  return {
    year: +map.year,
    month: +map.month,
    day: +map.day,
    hour: +map.hour,
    minute: +map.minute,
    weekday: WEEKDAYS.indexOf(map.weekday),
  }
}

function offsetMs(date: Date): number {
  const p = zonedParts(date)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, date.getUTCSeconds())
  return asUtc - Math.floor(date.getTime() / 1000) * 1000
}

/** The instant at which the venue clock reads `minutes` after midnight on `key`. */
export function zonedTime(key: DateKey, minutes: number): Date {
  const [y, m, d] = key.split("-").map(Number)
  const guess = Date.UTC(y, m - 1, d, 0, minutes)
  // Re-check the offset at the result so DST transitions land correctly.
  const first = guess - offsetMs(new Date(guess))
  return new Date(guess - offsetMs(new Date(first)))
}

export function toDateKey(date: Date): DateKey {
  const p = zonedParts(date)
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`
}

export function addDays(key: DateKey, days: number): DateKey {
  const [y, m, d] = key.split("-").map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + days))
  return t.toISOString().slice(0, 10)
}

/** 0 = Sunday, matching `football_pitch_availability.day_of_week`. */
export function dayOfWeek(key: DateKey): number {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

/** "18:30:00" → 1110. "24:00" and "00:00" as a closing time are handled by callers. */
export function parseClock(clock: string): number {
  const [h, m] = clock.split(":").map(Number)
  return h * 60 + (m || 0)
}

export function minutesOfDay(date: Date): number {
  const p = zonedParts(date)
  return p.hour * 60 + p.minute
}

export function formatClock(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
}

function fmt(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: VENUE_TZ, ...options })
}

const timeFmt = fmt({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
const weekdayFmt = fmt({ weekday: "short" })
const longWeekdayFmt = fmt({ weekday: "long" })
const dayMonthFmt = fmt({ day: "numeric", month: "short" })
const monthFmt = fmt({ month: "short" })
const fullFmt = fmt({ weekday: "long", day: "numeric", month: "long" })
const shortDateFmt = fmt({ day: "numeric", month: "short", year: "numeric" })

export const formatTime = (d: Date) => timeFmt.format(d)
export const formatWeekday = (d: Date) => weekdayFmt.format(d)
export const formatLongWeekday = (d: Date) => longWeekdayFmt.format(d)
export const formatDayMonth = (d: Date) => dayMonthFmt.format(d)
export const formatMonth = (d: Date) => monthFmt.format(d)
export const formatFullDate = (d: Date) => fullFmt.format(d)
export const formatShortDate = (d: Date) => shortDateFmt.format(d)

/** "Today", "Tomorrow", or "Sat 4 Oct" relative to `now` in the venue zone. */
export function relativeDayLabel(date: Date, now: Date = new Date()): string {
  const key = toDateKey(date)
  const today = toDateKey(now)
  if (key === today) return "Today"
  if (key === addDays(today, 1)) return "Tomorrow"
  if (key === addDays(today, -1)) return "Yesterday"
  return `${formatWeekday(date)} ${formatDayMonth(date)}`
}

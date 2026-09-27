import { type DateKey, dayOfWeek, parseClock, zonedTime } from "@/lib/utils/time"

export interface AvailabilityWindow {
  day_of_week: number
  opens_at: string
  closes_at: string
  is_active: boolean
  effective_from?: string | null
  effective_to?: string | null
}

export interface BusyRange {
  starts_at: string
  ends_at: string
}

export interface Slot {
  start: Date
  end: Date
  /** Minutes after midnight (venue time) — used for grouping and labels. */
  startMinutes: number
  /** False when it overlaps another booking or a venue blackout. */
  available: boolean
}

/** How far ahead players can book. */
export const BOOKING_WINDOW_DAYS = 21

/** Venues must get at least this much notice before a slot starts. */
export const MIN_LEAD_MINUTES = 30

export function windowsForDay(key: DateKey, availability: AvailabilityWindow[]): AvailabilityWindow[] {
  const dow = dayOfWeek(key)
  return availability.filter(
    (a) =>
      a.is_active &&
      a.day_of_week === dow &&
      (!a.effective_from || a.effective_from.slice(0, 10) <= key) &&
      (!a.effective_to || a.effective_to.slice(0, 10) >= key),
  )
}

/** Opening window in minutes; a close at or before the open time runs past midnight. */
function windowMinutes(w: AvailabilityWindow): [number, number] {
  const open = parseClock(w.opens_at)
  let close = parseClock(w.closes_at)
  if (close <= open) close += 1440
  return [open, close]
}

export function isOpenOn(key: DateKey, availability: AvailabilityWindow[]): boolean {
  return windowsForDay(key, availability).length > 0
}

export function buildSlots({
  date,
  availability,
  busy,
  durationMinutes,
  stepMinutes,
  now = new Date(),
}: {
  date: DateKey
  availability: AvailabilityWindow[]
  busy: BusyRange[]
  durationMinutes: number
  stepMinutes: number
  now?: Date
}): Slot[] {
  const step = Math.max(15, stepMinutes || 30)
  const earliest = now.getTime() + MIN_LEAD_MINUTES * 60_000
  const busyMs = busy.map((b) => [Date.parse(b.starts_at), Date.parse(b.ends_at)] as const)
  const seen = new Set<number>()
  const slots: Slot[] = []

  for (const w of windowsForDay(date, availability)) {
    const [open, close] = windowMinutes(w)
    for (let m = open; m + durationMinutes <= close; m += step) {
      if (seen.has(m)) continue
      seen.add(m)
      const start = zonedTime(date, m)
      const end = zonedTime(date, m + durationMinutes)
      const s = start.getTime()
      const e = end.getTime()
      // Slots that have already passed are hidden rather than greyed out.
      if (s < earliest) continue
      const clashes = busyMs.some(([bs, be]) => bs < e && be > s)
      slots.push({ start, end, startMinutes: m, available: !clashes })
    }
  }

  return slots.sort((a, b) => a.startMinutes - b.startMinutes)
}

/** Duration choices a player can pick, never shorter than the venue minimum. */
export function durationOptions(minMinutes: number): number[] {
  const base = [60, 90, 120]
  const min = Math.max(30, minMinutes || 60)
  const options = base.filter((d) => d >= min)
  if (!options.includes(min)) options.unshift(min)
  return options.slice(0, 3)
}

export function priceFor(pricePerHourCents: number | null, minutes: number): number {
  if (!pricePerHourCents) return 0
  return Math.round((minutes / 60) * pricePerHourCents)
}

export function playersForFormat(format: string): number {
  const n = parseInt(format, 10)
  return Number.isFinite(n) ? n * 2 : 10
}

export function formatDurationMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m} min`
  return m ? `${h}h ${m}m` : `${h}h`
}

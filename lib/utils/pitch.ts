import { windowsForDay, type AvailabilityWindow } from "@/lib/booking/slots"
import { parseClock, toDateKey, minutesOfDay, formatClock } from "@/lib/utils/time"

export const CITIES = ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta"]
export const FORMATS = ["5v5", "6v6", "7v7", "8v8", "9v9", "11v11"]

const SURFACE_LABELS: Record<string, string> = {
  artificial_turf: "Artificial turf",
  natural_grass: "Natural grass",
  hybrid: "Hybrid grass",
  indoor: "Indoor court",
}

export function surfaceLabel(surface: string) {
  return SURFACE_LABELS[surface] ?? surface.replaceAll("_", " ")
}

export type OpenStatus =
  | { state: "open"; label: string }
  | { state: "later"; label: string }
  | { state: "closed"; label: string }

const clockLabel = (m: number) => (m % 1440 === 0 ? "midnight" : formatClock(m))

/** A short, glanceable line such as "Open until 23:00" or "Opens 17:00". */
export function openStatus(availability: AvailabilityWindow[], now: Date = new Date()): OpenStatus {
  const windows = windowsForDay(toDateKey(now), availability)
  if (!windows.length) return { state: "closed", label: "Closed today" }
  const nowMin = minutesOfDay(now)
  for (const w of windows.sort((a, b) => parseClock(a.opens_at) - parseClock(b.opens_at))) {
    const open = parseClock(w.opens_at)
    let close = parseClock(w.closes_at)
    if (close <= open) close += 1440
    if (nowMin < open) return { state: "later", label: `Opens ${clockLabel(open)}` }
    if (nowMin < close) return { state: "open", label: `Open until ${clockLabel(close)}` }
  }
  return { state: "closed", label: "Closed for today" }
}

export function mapsUrl(venue: { name?: string | null; address?: string | null; city?: string | null; lat?: number | null; lng?: number | null }) {
  const query =
    venue.lat != null && venue.lng != null
      ? `${venue.lat},${venue.lng}`
      : [venue.name, venue.address, venue.city, "Cyprus"].filter(Boolean).join(", ")
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

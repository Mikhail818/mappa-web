import { formatDistanceToNow } from "date-fns"
import { formatShortDate, formatTime, relativeDayLabel } from "./time"

export function formatCurrency(cents: number | null | undefined): string {
  if (cents == null) return "—"
  // Whole euros read cleaner ("€40"); keep cents only when they matter.
  const euros = cents / 100
  return `€${Number.isInteger(euros) ? euros : euros.toFixed(2)}`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return `${relativeDayLabel(d)}, ${formatTime(d)}`
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return formatShortDate(d)
}

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatDuration(startAt: string, endsAt: string): string {
  const start = new Date(startAt)
  const end = new Date(endsAt)
  const mins = (end.getTime() - start.getTime()) / 60000
  if (mins < 60) return `${mins}min`
  const hours = mins / 60
  return hours === Math.floor(hours) ? `${hours}h` : `${hours.toFixed(1)}h`
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return xp.toString()
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

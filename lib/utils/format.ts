import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns"

export function formatCurrency(cents: number | null | undefined): string {
  if (cents == null) return "—"
  return `€${(cents / 100).toFixed(2)}`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  if (isToday(d)) return `Today, ${format(d, "HH:mm")}`
  if (isTomorrow(d)) return `Tomorrow, ${format(d, "HH:mm")}`
  return format(d, "EEE d MMM, HH:mm")
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "d MMM yyyy")
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

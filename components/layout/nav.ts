import { CalendarCheck, House, MapPin, Swords, Users, type LucideIcon } from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Other route prefixes that should light this item up. */
  match: string[]
}

export const PLAYER_NAV: NavItem[] = [
  { href: "/home", label: "Home", icon: House, match: ["/home"] },
  { href: "/pitches", label: "Book", icon: MapPin, match: ["/pitches", "/book"] },
  { href: "/lobbies", label: "Play", icon: Swords, match: ["/lobbies", "/matches"] },
  { href: "/players", label: "Players", icon: Users, match: ["/players"] },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck, match: ["/bookings"] },
]

export function isActive(item: NavItem, pathname: string) {
  return item.match.some((m) => pathname === m || pathname.startsWith(`${m}/`))
}

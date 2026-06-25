"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  BarChart3,
  Users,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Star,
  FileText,
  ClipboardList,
  Share2,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarLink {
  href: string
  label: string
  icon: React.ReactNode
}

const OWNER_LINKS: SidebarLink[] = [
  { href: "/owner", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/owner/bookings", label: "Bookings", icon: <CalendarCheck className="h-4 w-4" /> },
  { href: "/owner/venues", label: "Venues", icon: <Building2 className="h-4 w-4" /> },
  { href: "/owner/analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
]

const ADMIN_LINKS: SidebarLink[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/cities", label: "City Health", icon: <MapPin className="h-4 w-4" /> },
  { href: "/admin/funnel", label: "Funnel", icon: <TrendingUp className="h-4 w-4" /> },
  { href: "/admin/players", label: "Players", icon: <Users className="h-4 w-4" /> },
  { href: "/admin/liquidity", label: "Liquidity", icon: <AlertTriangle className="h-4 w-4" /> },
  { href: "/admin/quality", label: "Quality", icon: <Star className="h-4 w-4" /> },
  { href: "/admin/signups", label: "Signups", icon: <ClipboardList className="h-4 w-4" /> },
  { href: "/admin/reports", label: "Reports", icon: <FileText className="h-4 w-4" /> },
  { href: "/admin/applications", label: "Applications", icon: <ShieldCheck className="h-4 w-4" /> },
  { href: "/admin/referrals", label: "Referrals", icon: <Share2 className="h-4 w-4" /> },
]

export function Sidebar({ variant }: { variant: "owner" | "admin" }) {
  const pathname = usePathname()
  const links = variant === "owner" ? OWNER_LINKS : ADMIN_LINKS
  const baseTitle = variant === "owner" ? "Venue Portal" : "Admin Panel"

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-sidebar h-full min-h-screen flex flex-col">
      <div className="px-4 py-5 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {baseTitle}
        </p>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {links.map(({ href, label, icon }) => {
          const isActive = href === `/${variant}` ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              {icon}
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

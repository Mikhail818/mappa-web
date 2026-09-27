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
  ArrowLeft,
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
  const baseTitle = variant === "owner" ? "Venue portal" : "Admin"
  const isActive = (href: string) => (href === `/${variant}` ? pathname === href : pathname.startsWith(href))

  return (
    <>
      {/* Phones: a scrollable tab strip under the top bar */}
      <nav
        aria-label={baseTitle}
        className="glass sticky top-14 z-30 -mb-px flex gap-1.5 overflow-x-auto border-b border-border/70 px-4 py-2 scrollbar-none md:hidden"
      >
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
              isActive(href) ? "bg-foreground text-background" : "bg-muted/70 text-muted-foreground",
            )}
          >
            {icon}
            {label}
          </Link>
        ))}
      </nav>

      {/* Tablets and up: a sidebar */}
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col border-r border-border/70 bg-sidebar md:flex">
        <p className="px-5 pt-6 pb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{baseTitle}</p>
        <nav aria-label={baseTitle} className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {links.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/home" className="m-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Mappa
        </Link>
      </aside>
    </>
  )
}

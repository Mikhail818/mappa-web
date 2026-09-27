"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { PLAYER_NAV, isActive } from "./nav"

/** Bottom tab bar for phones — the primary destinations, always one tap away. */
export function TabBar() {
  const pathname = usePathname()
  // Drill-down screens with their own bottom action bar hide the tabs.
  if (pathname.startsWith("/book/") || /^\/pitches\/[^/]+$/.test(pathname)) return null

  return (
    <nav
      aria-label="Primary"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border/70 pb-safe md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {PLAYER_NAV.map((item) => {
          const active = isActive(item, pathname)
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 pt-2 pb-1 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground active:text-foreground",
                )}
              >
                <Icon className={cn("size-6 transition-transform", active && "scale-105")} strokeWidth={active ? 2.3 : 1.8} />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

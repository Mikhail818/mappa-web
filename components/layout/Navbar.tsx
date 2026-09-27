"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Bell, LogOut, MapPin, Monitor, Moon, Settings, Sun, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Logo } from "@/components/brand/Logo"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/types/database.types"
import { cn } from "@/lib/utils"
import { initialsOf } from "@/lib/utils/format"
import { PLAYER_NAV, isActive } from "./nav"

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

export function Navbar({ profile, showNav = true }: { profile: Profile | null; showNav?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="glass sticky top-0 z-40 border-b border-border/70">
      <div className={cn("mx-auto flex h-14 items-center justify-between gap-4 px-4", showNav ? "max-w-6xl" : "max-w-none md:px-5")}>
        <Link href="/home" aria-label="Mappa home">
          <Logo markClassName="size-7" />
        </Link>

        {showNav && (
        <nav aria-label="Primary" className="hidden items-center gap-0.5 rounded-full bg-muted/70 p-1 md:flex">
          {PLAYER_NAV.map((item) => {
            const active = isActive(item, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                  active
                    ? "bg-card text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        )}

        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "rounded-full",
              pathname.startsWith("/notifications") && "bg-muted",
            )}
          >
            <Bell className="size-5" />
          </Link>

          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" className="rounded-full" aria-label="Account" />}
              >
                <Avatar className="size-8">
                  <AvatarImage src={profile.avatar_url ?? undefined} alt="" />
                  <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                    {initialsOf(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="px-2 py-2">
                  <p className="truncate text-sm font-semibold">{profile.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="size-4" /> Profile
                </DropdownMenuItem>
                {profile.is_venue_owner && (
                  <DropdownMenuItem onClick={() => router.push("/owner")}>
                    <MapPin className="size-4" /> Venue portal
                  </DropdownMenuItem>
                )}
                {profile.is_founding_player && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    <Settings className="size-4" /> Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <div className="px-1.5 py-1">
                  <p className="px-1 pb-1.5 text-xs text-muted-foreground">Appearance</p>
                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-0.5">
                    {THEMES.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTheme(value)}
                        aria-pressed={theme === value}
                        className={cn(
                          "flex flex-col items-center gap-0.5 rounded-md py-1.5 text-[11px] font-medium transition-colors",
                          theme === value ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="size-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} variant="destructive">
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className={buttonVariants({ size: "sm" })}>Sign in</Link>
          )}
        </div>
      </div>
    </header>
  )
}

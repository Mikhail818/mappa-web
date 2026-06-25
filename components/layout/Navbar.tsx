"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Menu, X, Trophy, User, LogOut, Settings, Bell, MapPin } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/types/database.types"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/players", label: "Players" },
  { href: "/matches", label: "Matches" },
  { href: "/lobbies", label: "Lobbies" },
  { href: "/pitches", label: "Pitches" },
  { href: "/bookings", label: "Bookings" },
]

export function Navbar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Trophy className="h-4 w-4 text-primary-foreground" />
          </div>
          Mappa
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link href="/notifications" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden md:flex")}>
            <Bell className="h-4 w-4" />
          </Link>

          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 px-2" size="sm" />}>
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {initials ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                    {profile.full_name}
                  </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push("/profile")} className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" /> Profile
                </DropdownMenuItem>
                {profile.is_venue_owner && (
                  <DropdownMenuItem onClick={() => router.push("/owner")} className="flex items-center gap-2 cursor-pointer">
                    <MapPin className="h-4 w-4" /> Venue Portal
                  </DropdownMenuItem>
                )}
                {profile.is_founding_player && (
                  <DropdownMenuItem onClick={() => router.push("/admin")} className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" /> Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className={buttonVariants({ size: "sm" })}>Sign in</Link>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border md:hidden">
          <nav className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-medium",
                  pathname.startsWith(href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/common/StatusBadge"
import { SkillBadge } from "@/components/common/SkillBadge"
import { formatDate, formatXP } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import {
  Users, Swords, Calendar, MapPin, ChevronRight,
  Trophy, Star, Target, Zap,
} from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Home" }

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { data: upcomingMatches }, { data: recentBookings }, { count: playerCount }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("matches")
        .select(`*, opponent:profiles!matches_opponent_id_fkey(full_name, avatar_url, skill_level), player:profiles!matches_player_id_fkey(full_name, avatar_url), court:courts(name, city)`)
        .or(`player_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .in("status", ["pending", "confirmed"])
        .order("scheduled_at", { ascending: true })
        .limit(5),
      supabase
        .from("football_bookings")
        .select(`*, pitch:football_pitches(name, venue:football_venues(name, city))`)
        .eq("requester_id", user.id)
        .in("status", ["requested", "confirmed"])
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(3),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("onboarding_completed", true),
    ])

  if (!profile) redirect("/onboarding")

  const totalMatches = (profile.wins ?? 0) + (profile.losses ?? 0)
  const weeklyProgress = Math.min(100, (totalMatches % 7) / (profile.weekly_play_target || 1) * 100)

  const xpLevel = Math.floor((profile.xp ?? 0) / 100) + 1
  const xpProgress = (profile.xp ?? 0) % 100

  const ONBOARDING_CHECKLIST = [
    { label: "Profile created", done: true },
    { label: "Onboarding completed", done: profile.onboarding_completed },
    { label: "First match played", done: totalMatches > 0 },
    { label: "Pitch booked", done: (recentBookings?.length ?? 0) > 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {profile.full_name.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{profile.home_city} · <SkillBadge level={profile.skill_level} /></p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xs text-muted-foreground">Level {xpLevel}</div>
          <div className="text-lg font-bold text-primary">{formatXP(profile.xp ?? 0)} XP</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Wins", value: profile.wins ?? 0, icon: <Trophy className="h-4 w-4 text-amber-500" /> },
          { label: "Losses", value: profile.losses ?? 0, icon: <Swords className="h-4 w-4 text-red-500" /> },
          { label: "Rating", value: Number(profile.rating).toFixed(1), icon: <Star className="h-4 w-4 text-yellow-500" /> },
          { label: "Reliability", value: `${Math.round(Number(profile.reliability_score))}%`, icon: <Zap className="h-4 w-4 text-primary" /> },
        ].map(({ label, value, icon }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                {icon} {label}
              </div>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col: weekly goal + checklist */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Weekly Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={weeklyProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {totalMatches % 7} of {profile.weekly_play_target} matches this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">XP Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Level {xpLevel}</span>
                <span>{xpProgress}/100 XP</span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ONBOARDING_CHECKLIST.map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <div className={`h-4 w-4 rounded-full flex items-center justify-center text-xs ${done ? "bg-primary text-primary-foreground" : "border-2 border-muted-foreground/30"}`}>
                    {done && "✓"}
                  </div>
                  <span className={done ? "line-through text-muted-foreground" : ""}>{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Social proof */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">{playerCount ?? 0} players</span>
              </div>
              <p className="text-xs opacity-80">are active on Mappa in Cyprus</p>
            </CardContent>
          </Card>
        </div>

        {/* Right col: upcoming */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Swords className="h-4 w-4 text-primary" /> Upcoming Matches
              </CardTitle>
              <Link href="/matches" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs h-7")}>
                View all <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingMatches?.length ? (
                upcomingMatches.map((m) => {
                  const isPlayer = m.player_id === user.id
                  const opponent = isPlayer ? m.opponent : m.player
                  return (
                    <Link
                      key={m.id}
                      href={`/matches/${m.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {(opponent as unknown as { full_name: string } | null)?.full_name?.[0] ?? "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">vs {(opponent as unknown as { full_name: string } | null)?.full_name}</p>
                          {m.scheduled_at && (
                            <p className="text-xs text-muted-foreground">{formatDate(m.scheduled_at)}</p>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={m.status} />
                    </Link>
                  )
                })
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">No upcoming matches</p>
                  <Link href="/players" className={cn(buttonVariants({ size: "sm" }), "mt-2")}>Find a player</Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Upcoming Bookings
              </CardTitle>
              <Link href="/bookings" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs h-7")}>
                View all <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentBookings?.length ? (
                recentBookings.map((b) => {
                  const pitch = b.pitch as unknown as { name: string; venue: { name: string; city: string } } | null
                  return (
                    <Link
                      key={b.id}
                      href={`/bookings/${b.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{pitch?.venue?.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(b.starts_at)} · {pitch?.name}</p>
                        </div>
                      </div>
                      <StatusBadge status={b.status} />
                    </Link>
                  )
                })
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">No upcoming bookings</p>
                  <Link href="/pitches" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-2")}>Browse pitches</Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/players", label: "Find Players", icon: <Users className="h-5 w-5" />, color: "text-primary" },
          { href: "/lobbies/new", label: "Create Lobby", icon: <Swords className="h-5 w-5" />, color: "text-amber-600" },
          { href: "/pitches", label: "Book Pitch", icon: <MapPin className="h-5 w-5" />, color: "text-green-600" },
          { href: "/apply-owner", label: "Own a Venue?", icon: <Trophy className="h-5 w-5" />, color: "text-purple-600" },
        ].map(({ href, label, icon, color }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4 pb-3 text-center">
                <div className={`mx-auto h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-2 ${color}`}>
                  {icon}
                </div>
                <p className="text-xs font-medium">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

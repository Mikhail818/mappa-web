import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/common/StatusBadge"
import { SkillBadge } from "@/components/common/SkillBadge"
import { PitchArt } from "@/components/pitches/PitchArt"
import { formatDate, formatXP } from "@/lib/utils/format"
import { addDays, dayOfWeek, formatFullDate, formatTime, relativeDayLabel, toDateKey, zonedParts, zonedTime } from "@/lib/utils/time"
import { cn } from "@/lib/utils"
import {
  ArrowRight, CalendarPlus, Check, ChevronRight, MapPin, Search, ShieldCheck, Star, Swords, Trophy, Users,
} from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Home" }

type Person = { full_name: string; avatar_url: string | null } | null
type BookingRow = {
  id: string
  status: string
  starts_at: string
  ends_at: string
  format: string
  pitch_id: string
  pitch: { name: string; surface: string; indoor: boolean; venue: { name: string; city: string } | null } | null
}

function greeting(now: Date) {
  const h = zonedParts(now).hour
  if (h < 5) return "Late one"
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const now = new Date()
  const today = toDateKey(now)
  const weekStart = zonedTime(addDays(today, -((dayOfWeek(today) + 6) % 7)), 0).toISOString()

  const [
    { data: profile },
    { data: upcomingMatches },
    { data: upcomingBookings },
    { count: bookingsEver },
    { count: bookingsThisWeek },
    { count: matchesThisWeek },
    { count: playerCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("matches")
      .select(`id, status, scheduled_at, player_id, opponent:profiles!matches_opponent_id_fkey(full_name, avatar_url), player:profiles!matches_player_id_fkey(full_name, avatar_url)`)
      .or(`player_id.eq.${user.id},opponent_id.eq.${user.id}`)
      .in("status", ["pending", "confirmed"])
      .order("scheduled_at", { ascending: true, nullsFirst: false })
      .limit(4),
    supabase
      .from("football_bookings")
      .select(`id, status, starts_at, ends_at, format, pitch_id, pitch:football_pitches(name, surface, indoor, venue:football_venues(name, city))`)
      .eq("requester_id", user.id)
      .in("status", ["requested", "confirmed"])
      .gte("ends_at", now.toISOString())
      .order("starts_at", { ascending: true })
      .limit(4),
    supabase.from("football_bookings").select("id", { count: "exact", head: true }).eq("requester_id", user.id),
    supabase
      .from("football_bookings")
      .select("id", { count: "exact", head: true })
      .eq("requester_id", user.id)
      .eq("status", "confirmed")
      .gte("starts_at", weekStart)
      .lte("starts_at", now.toISOString()),
    supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .or(`player_id.eq.${user.id},opponent_id.eq.${user.id}`)
      .eq("status", "completed")
      .gte("scheduled_at", weekStart),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("onboarding_completed", true),
  ])

  if (!profile) redirect("/onboarding")

  const bookings = (upcomingBookings ?? []) as unknown as BookingRow[]
  const next = bookings[0]
  const firstName = profile.full_name.split(" ")[0]
  const totalMatches = (profile.wins ?? 0) + (profile.losses ?? 0)
  const target = Math.max(1, profile.weekly_play_target || 1)
  const playedThisWeek = (bookingsThisWeek ?? 0) + (matchesThisWeek ?? 0)
  const weeklyProgress = Math.min(100, (playedThisWeek / target) * 100)
  const xp = profile.xp ?? 0
  const xpLevel = Math.floor(xp / 100) + 1

  const checklist = [
    { label: "Set up your profile", done: true, href: "/profile" },
    { label: "Book your first pitch", done: (bookingsEver ?? 0) > 0, href: "/pitches" },
    { label: "Play your first 1v1", done: totalMatches > 0, href: "/players" },
  ]
  const checklistDone = checklist.every((c) => c.done)

  const quickActions = [
    { href: "/pitches", label: "Book a pitch", icon: MapPin, tint: "bg-primary/12 text-primary" },
    { href: "/lobbies", label: "Join a game", icon: Users, tint: "bg-sky-500/12 text-sky-600 dark:text-sky-400" },
    { href: "/lobbies/new", label: "Host a game", icon: CalendarPlus, tint: "bg-amber-500/12 text-amber-600 dark:text-amber-400" },
    { href: "/players", label: "Find players", icon: Search, tint: "bg-violet-500/12 text-violet-600 dark:text-violet-400" },
  ]

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{formatFullDate(now)} · {profile.home_city}</p>
          <h1 className="text-[28px] leading-tight font-bold md:text-3xl">
            {greeting(now)}, {firstName}
          </h1>
        </div>
        <Link href="/profile" className="hidden shrink-0 text-right sm:block">
          <p className="text-xs text-muted-foreground">Level {xpLevel}</p>
          <p className="text-lg font-bold text-primary">{formatXP(xp)} XP</p>
        </Link>
      </header>

      {/* Next up */}
      {next ? (
        <Link href={`/bookings/${next.id}`} className="block overflow-hidden rounded-3xl shadow-lift transition-transform active:scale-[0.99]">
          <PitchArt seed={next.pitch_id} surface={next.pitch?.surface} indoor={next.pitch?.indoor} className="min-h-44">
            <div className="flex min-h-44 flex-col justify-between gap-6 p-5 text-white">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
                  Next up
                </span>
                <StatusBadge status={next.status} className="bg-white/90 text-neutral-900 dark:bg-white/90 dark:text-neutral-900" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/85">
                  {relativeDayLabel(new Date(next.starts_at), now)} · {next.format}
                </p>
                <p className="text-4xl font-bold tracking-tight tabular-nums drop-shadow-sm">
                  {formatTime(new Date(next.starts_at))}
                </p>
                <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
                  <MapPin className="size-3.5" /> {next.pitch?.venue?.name} · {next.pitch?.name}
                </p>
              </div>
            </div>
          </PitchArt>
        </Link>
      ) : (
        <Link href="/pitches" className="group block overflow-hidden rounded-3xl shadow-lift transition-transform active:scale-[0.99]">
          <PitchArt seed={user.id} className="min-h-44">
            <div className="flex min-h-44 flex-col justify-end gap-3 p-5 text-white">
              <div>
                <p className="text-2xl font-bold tracking-tight drop-shadow-sm">Fancy a game this week?</p>
                <p className="mt-1 max-w-sm text-sm text-white/85">
                  See what&apos;s free near {profile.home_city} and book in a few taps.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition-transform group-hover:translate-x-0.5">
                Find a pitch <ArrowRight className="size-4" />
              </span>
            </div>
          </PitchArt>
        </Link>
      )}

      {/* Quick actions */}
      <nav aria-label="Quick actions" className="grid grid-cols-4 gap-3">
        {quickActions.map(({ href, label, icon: Icon, tint }) => (
          <Link key={href} href={href} className="group flex flex-col items-center gap-2 text-center">
            <span className={cn("flex size-14 items-center justify-center rounded-2xl transition-transform group-active:scale-90 sm:size-16", tint)}>
              <Icon className="size-6" />
            </span>
            <span className="text-xs leading-tight font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* This week */}
          <section className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/[0.06]">
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold">This week</h2>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{playedThisWeek}</span> of {target} games
              </p>
            </div>
            <Progress value={weeklyProgress} className="mt-3 h-2" />
            <div className="mt-5 grid grid-cols-4 divide-x divide-border/70 text-center">
              {[
                { label: "Wins", value: profile.wins ?? 0, icon: Trophy },
                { label: "Losses", value: profile.losses ?? 0, icon: Swords },
                { label: "Rating", value: Number(profile.rating ?? 0).toFixed(1), icon: Star },
                { label: "Reliable", value: `${Math.round(Number(profile.reliability_score ?? 0))}%`, icon: ShieldCheck },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="px-1">
                  <p className="text-xl font-bold tabular-nums">{value}</p>
                  <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                    <Icon className="size-3" /> {label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Coming up</h2>
              <Link href="/bookings" className="text-sm font-medium text-primary">See all</Link>
            </div>
            {bookings.length + (upcomingMatches?.length ?? 0) === 0 ? (
              <p className="rounded-2xl bg-card p-5 text-sm text-muted-foreground shadow-soft ring-1 ring-foreground/[0.06]">
                Nothing scheduled. <Link href="/lobbies" className="font-medium text-primary">Join an open game</Link> or{" "}
                <Link href="/players" className="font-medium text-primary">challenge someone</Link>.
              </p>
            ) : (
              <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-foreground/[0.06]">
                {bookings.slice(1).map((b) => (
                  <li key={b.id}>
                    <Link href={`/bookings/${b.id}`} className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                        <MapPin className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{b.pitch?.venue?.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{formatDate(b.starts_at)} · {b.format}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </Link>
                  </li>
                ))}
                {(upcomingMatches ?? []).map((m) => {
                  const opponent = (m.player_id === user.id ? m.opponent : m.player) as unknown as Person
                  return (
                    <li key={m.id}>
                      <Link href={`/matches/${m.id}`} className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/12 text-sm font-bold text-amber-600 dark:text-amber-400">
                          {opponent?.full_name?.[0] ?? "?"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">1v1 vs {opponent?.full_name ?? "TBC"}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {m.scheduled_at ? formatDate(m.scheduled_at) : "Time to be agreed"}
                          </p>
                        </div>
                        <StatusBadge status={m.status} />
                      </Link>
                    </li>
                  )
                })}
                {bookings.length === 1 && !(upcomingMatches?.length) && (
                  <li className="p-4 text-sm text-muted-foreground">That&apos;s everything for now.</li>
                )}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {!checklistDone && (
            <section className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/[0.06]">
              <h2 className="font-semibold">Get started</h2>
              <p className="text-sm text-muted-foreground">
                {checklist.filter((c) => c.done).length} of {checklist.length} done
              </p>
              <ul className="mt-3 space-y-1">
                {checklist.map(({ label, done, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className={cn("flex items-center gap-3 rounded-xl p-2 text-sm transition-colors hover:bg-muted", done && "pointer-events-none")}
                    >
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full",
                          done ? "bg-primary text-primary-foreground" : "border-2 border-muted-foreground/30",
                        )}
                      >
                        {done && <Check className="size-3.5" strokeWidth={3} />}
                      </span>
                      <span className={cn("flex-1", done && "text-muted-foreground line-through")}>{label}</span>
                      {!done && <ChevronRight className="size-4 text-muted-foreground" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/[0.06]">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Level {xpLevel}</h2>
              <SkillBadge level={profile.skill_level} />
            </div>
            <Progress value={xp % 100} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">{100 - (xp % 100)} XP to level {xpLevel + 1}</p>
          </section>

          <section className="rounded-3xl bg-secondary p-5 text-secondary-foreground">
            <p className="text-3xl font-bold tabular-nums">{playerCount ?? 0}</p>
            <p className="text-sm opacity-75">players on Mappa across Cyprus</p>
            <Link href="/players" className={cn(buttonVariants({ size: "sm" }), "mt-4 rounded-full bg-accent text-accent-foreground hover:bg-accent/90")}>
              Meet them <ArrowRight />
            </Link>
          </section>

          <Link href="/apply-owner" className="block text-center text-sm text-muted-foreground hover:text-foreground">
            Own a venue? <span className="font-medium text-primary">List it on Mappa</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

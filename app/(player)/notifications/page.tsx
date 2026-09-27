import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StatusBadge } from "@/components/common/StatusBadge"
import { formatTime, relativeDayLabel } from "@/lib/utils/time"
import { PageHeader } from "@/components/common/PageHeader"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/common/EmptyState"
import { Bell, CalendarCheck, ChevronRight, Swords } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Notifications" }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Build a notification feed from recent matches and bookings
  const [{ data: matchActivity }, { data: bookingActivity }] = await Promise.all([
    supabase
      .from("matches")
      .select(`id, status, created_at, updated_at, player_id, opponent:profiles!matches_opponent_id_fkey(full_name), player:profiles!matches_player_id_fkey(full_name)`)
      .or(`player_id.eq.${user.id},opponent_id.eq.${user.id}`)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("football_bookings")
      .select(`id, status, updated_at, pitch:football_pitches(name, venue:football_venues(name))`)
      .eq("requester_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(10),
  ])

  type Named = { full_name: string } | null
  const firstName = (p: Named) => p?.full_name?.split(" ")[0] ?? "A player"

  const matchTitle = (status: string, sentByMe: boolean, other: string) => {
    switch (status) {
      case "pending": return sentByMe ? `Challenge sent to ${other}` : `${other} challenged you to a 1v1`
      case "confirmed": return `1v1 with ${other} is on`
      case "completed": return `Result in: you vs ${other}`
      case "disputed": return `Score with ${other} is under review`
      case "cancelled": case "declined": return `1v1 with ${other} was called off`
      default: return `1v1 with ${other}`
    }
  }
  const bookingTitle = (status: string, venue: string) => {
    switch (status) {
      case "requested": return `Request sent to ${venue}`
      case "confirmed": return `${venue} confirmed your booking`
      case "declined": return `${venue} couldn't take your booking`
      case "cancelled": return `Booking at ${venue} cancelled`
      default: return `Booking at ${venue}`
    }
  }

  const notifications = [
    ...(matchActivity ?? []).map((m) => {
      const sentByMe = m.player_id === user.id
      const other = firstName((sentByMe ? m.opponent : m.player) as unknown as Named)
      return {
        id: `match-${m.id}`,
        type: "match" as const,
        title: matchTitle(m.status, sentByMe, other),
        href: `/matches/${m.id}`,
        status: m.status,
        time: m.updated_at,
        needsYou: m.status === "pending" && !sentByMe,
      }
    }),
    ...(bookingActivity ?? []).map((b) => ({
      id: `booking-${b.id}`,
      type: "booking" as const,
      title: bookingTitle(b.status, (b.pitch as unknown as { venue: { name: string } } | null)?.venue?.name ?? "The venue"),
      href: `/bookings/${b.id}`,
      status: b.status,
      time: b.updated_at,
      needsYou: false,
    })),
  ].sort((a, b) => b.time.localeCompare(a.time))

  const groups = new Map<string, typeof notifications>()
  for (const n of notifications) {
    const label = relativeDayLabel(new Date(n.time))
    groups.set(label, [...(groups.get(label) ?? []), n])
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader title="Notifications" />
      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="size-7" />} title="You're all caught up" description="Challenges, game invites and booking updates will show up here." />
      ) : (
        [...groups].map(([label, items]) => (
          <section key={label} className="space-y-2">
            <h2 className="px-1 text-sm font-semibold text-muted-foreground">{label}</h2>
            <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-foreground/[0.06]">
              {items.map((n) => (
                <li key={n.id}>
                  <Link href={n.href} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50">
                    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", n.type === "match" ? "bg-amber-500/12 text-amber-600 dark:text-amber-400" : "bg-primary/10 text-primary")}>
                      {n.type === "match" ? <Swords className="size-5" /> : <CalendarCheck className="size-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[15px] leading-snug", n.needsYou && "font-semibold")}>{n.title}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        {formatTime(new Date(n.time))}
                        <StatusBadge status={n.status} />
                      </p>
                    </div>
                    {n.needsYou && <span className="size-2.5 shrink-0 rounded-full bg-primary" aria-label="Needs your reply" />}
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}

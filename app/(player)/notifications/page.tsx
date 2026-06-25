import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/common/StatusBadge"
import { formatTimeAgo } from "@/lib/utils/format"
import { EmptyState } from "@/components/common/EmptyState"
import { Bell, Swords, Calendar } from "lucide-react"
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

  const notifications = [
    ...(matchActivity ?? []).map((m) => ({
      id: `match-${m.id}`,
      type: "match" as const,
      title: m.status === "pending" ? "Match request received" : `Match ${m.status}`,
      subtitle: `vs ${m.player_id === user.id ? (m.opponent as unknown as { full_name: string } | null)?.full_name : (m.player as unknown as { full_name: string } | null)?.full_name}`,
      href: `/matches/${m.id}`,
      status: m.status,
      time: m.updated_at,
    })),
    ...(bookingActivity ?? []).map((b) => ({
      id: `booking-${b.id}`,
      type: "booking" as const,
      title: `Booking ${b.status}`,
      subtitle: (b.pitch as unknown as { name: string; venue: { name: string } } | null)?.venue?.name ?? "Pitch booking",
      href: `/bookings/${b.id}`,
      status: b.status,
      time: b.updated_at,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-7 w-7" />}
          title="All caught up!"
          description="No recent activity"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Link key={n.id} href={n.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${n.type === "match" ? "bg-primary/10" : "bg-green-100"}`}>
                      {n.type === "match"
                        ? <Swords className="h-4 w-4 text-primary" />
                        : <Calendar className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.subtitle}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <StatusBadge status={n.status} />
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(n.time)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

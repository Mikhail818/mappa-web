import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Liquidity Monitor" }

export default async function AdminLiquidityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [
    { count: pendingMatches },
    { count: openLobbies },
    { count: openSeats },
    { count: activeBookings },
  ] = await Promise.all([
    supabase.from("matches").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("open_matches").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase
      .from("open_matches")
      .select("id, max_players", { count: "exact", head: false })
      .eq("status", "open"),
    supabase
      .from("football_bookings")
      .select("id", { count: "exact", head: true })
      .in("status", ["requested", "confirmed"])
      .gte("starts_at", new Date().toISOString()),
  ])

  const metrics = [
    { label: "Pending Match Challenges", value: pendingMatches ?? 0, description: "1v1 match requests awaiting acceptance" },
    { label: "Open Lobbies", value: openLobbies ?? 0, description: "Group matches seeking more players" },
    { label: "Active Pitch Bookings", value: activeBookings ?? 0, description: "Upcoming bookings" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Liquidity Monitor</h1>
      <p className="text-muted-foreground text-sm">Supply and demand balance across the platform</p>
      <div className="grid sm:grid-cols-3 gap-4">
        {metrics.map(({ label, value, description }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-5 text-center">
              <div className="text-4xl font-bold text-primary">{value}</div>
              <div className="font-medium text-sm mt-1">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Health Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span>Match challenge acceptance rate</span>
              <span className="font-semibold text-muted-foreground">— (need historical data)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span>Avg time to fill a lobby</span>
              <span className="font-semibold text-muted-foreground">— (need historical data)</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Booking confirmation rate</span>
              <span className="font-semibold text-muted-foreground">— (need historical data)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

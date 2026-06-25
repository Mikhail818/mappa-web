import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { StatusBadge } from "@/components/common/StatusBadge"
import { formatDate, formatCurrency } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import { CalendarCheck, Building2, TrendingUp, Clock, ChevronRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Owner Dashboard" }

export default async function OwnerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: adminEntries } = await supabase.from("football_venue_admins").select("venue_id").eq("user_id", user.id)
  const venueIds = (adminEntries ?? []).map((r) => r.venue_id)

  const { data: pitchRows } = await supabase.from("football_pitches").select("id").in("venue_id", venueIds.length ? venueIds : ["none"])
  const pitchIds = (pitchRows ?? []).map((r) => r.id)

  const [{ data: pending }, { data: upcoming }, { data: venues }] = await Promise.all([
    supabase
      .from("football_bookings")
      .select(`*, pitch:football_pitches(name), requester:profiles!football_bookings_requester_id_fkey(full_name)`)
      .in("pitch_id", pitchIds.length ? pitchIds : ["none"])
      .eq("status", "requested")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("football_bookings")
      .select(`*, pitch:football_pitches(name, venue:football_venues(name))`)
      .in("pitch_id", pitchIds.length ? pitchIds : ["none"])
      .eq("status", "confirmed")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(5),
    supabase.from("football_venues").select("id, name, city").in("id", venueIds.length ? venueIds : ["none"]),
  ])

  const revenue = (upcoming ?? []).reduce((sum, b) => sum + (b.total_price_cents ?? 0), 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Venue Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Pending Requests", value: pending?.length ?? 0, icon: <Clock className="h-4 w-4 text-yellow-500" />, href: "/owner/bookings" },
          { label: "Upcoming Bookings", value: upcoming?.length ?? 0, icon: <CalendarCheck className="h-4 w-4 text-primary" />, href: "/owner/bookings" },
          { label: "Your Venues", value: venues?.length ?? 0, icon: <Building2 className="h-4 w-4 text-blue-500" />, href: "/owner/venues" },
          { label: "Expected Revenue", value: formatCurrency(revenue), icon: <TrendingUp className="h-4 w-4 text-green-500" />, href: "/owner/analytics" },
        ].map(({ label, value, icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">{icon} {label}</div>
                <div className="text-2xl font-bold">{value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Link href="/owner/bookings" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs h-7")}>
              View all <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending requests</p>
            ) : (
              pending?.map((b) => {
                const pitch = b.pitch as unknown as { name: string } | null
                const requester = b.requester as unknown as { full_name: string } | null
                return (
                  <Link key={b.id} href={`/owner/bookings`}>
                    <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{requester?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{pitch?.name} · {formatDate(b.starts_at)}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  </Link>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming Confirmed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming bookings</p>
            ) : (
              upcoming?.map((b) => {
                const pitch = b.pitch as unknown as { name: string; venue: { name: string } } | null
                return (
                  <div key={b.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{pitch?.venue?.name}</p>
                      <p className="text-xs text-muted-foreground">{pitch?.name} · {formatDate(b.starts_at)}</p>
                    </div>
                    {b.total_price_cents && (
                      <span className="font-semibold text-primary text-sm">{formatCurrency(b.total_price_cents)}</span>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

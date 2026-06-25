import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"
import { TrendingUp, CalendarCheck, Clock, Percent } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Analytics" }

export default async function OwnerAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: adminEntries } = await supabase.from("football_venue_admins").select("venue_id").eq("user_id", user.id)
  const venueIds = (adminEntries ?? []).map((r) => r.venue_id)
  const { data: pitchRows } = await supabase.from("football_pitches").select("id").in("venue_id", venueIds.length ? venueIds : ["none"])
  const pitchIds = (pitchRows ?? []).map((r) => r.id)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  const [{ data: thisMonthBookings }, { data: lastMonthBookings }, { data: allConfirmed }] = await Promise.all([
    supabase
      .from("football_bookings")
      .select("total_price_cents, status")
      .in("pitch_id", pitchIds.length ? pitchIds : ["none"])
      .gte("starts_at", startOfMonth)
      .in("status", ["confirmed", "completed"]),
    supabase
      .from("football_bookings")
      .select("total_price_cents, status")
      .in("pitch_id", pitchIds.length ? pitchIds : ["none"])
      .gte("starts_at", startOfLastMonth)
      .lte("starts_at", endOfLastMonth)
      .in("status", ["confirmed", "completed"]),
    supabase
      .from("football_bookings")
      .select("total_price_cents, status, starts_at")
      .in("pitch_id", pitchIds.length ? pitchIds : ["none"])
      .in("status", ["confirmed", "completed"]),
  ])

  const thisRevenue = (thisMonthBookings ?? []).reduce((s, b) => s + (b.total_price_cents ?? 0), 0)
  const lastRevenue = (lastMonthBookings ?? []).reduce((s, b) => s + (b.total_price_cents ?? 0), 0)
  const totalRevenue = (allConfirmed ?? []).reduce((s, b) => s + (b.total_price_cents ?? 0), 0)
  const revenueChange = lastRevenue > 0 ? Math.round(((thisRevenue - lastRevenue) / lastRevenue) * 100) : 0
  const totalBookings = allConfirmed?.length ?? 0

  const stats = [
    { label: "This Month Revenue", value: formatCurrency(thisRevenue), icon: <TrendingUp className="h-4 w-4 text-green-500" />, sub: `${revenueChange >= 0 ? "+" : ""}${revenueChange}% vs last month` },
    { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: <TrendingUp className="h-4 w-4 text-primary" />, sub: "All time" },
    { label: "Total Bookings", value: totalBookings, icon: <CalendarCheck className="h-4 w-4 text-blue-500" />, sub: "All time" },
    { label: "This Month Bookings", value: thisMonthBookings?.length ?? 0, icon: <Clock className="h-4 w-4 text-yellow-500" />, sub: `${lastMonthBookings?.length ?? 0} last month` },
  ]

  // Revenue by month (last 6)
  const monthlyData: Record<string, number> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" })
    monthlyData[key] = 0
  }
  ;(allConfirmed ?? []).forEach((b) => {
    const d = new Date(b.starts_at)
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" })
    if (key in monthlyData) monthlyData[key] += b.total_price_cents ?? 0
  })

  const maxRevenue = Math.max(...Object.values(monthlyData), 1)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon, sub }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">{icon} {label}</div>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Revenue (last 6 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {Object.entries(monthlyData).map(([month, revenue]) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary/80 rounded-t-sm min-h-[4px]"
                  style={{ height: `${Math.round((revenue / maxRevenue) * 100)}%` }}
                />
                <span className="text-xs text-muted-foreground">{month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

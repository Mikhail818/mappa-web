import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "City Health" }

export default async function AdminCitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: players }, { data: venues }] = await Promise.all([
    supabase.from("profiles").select("home_city").not("home_city", "is", null),
    supabase.from("football_venues").select("city").not("city", "is", null),
  ])

  const playerCounts: Record<string, number> = {}
  ;(players ?? []).forEach((p) => {
    const c = p.home_city ?? "Unknown"
    playerCounts[c] = (playerCounts[c] ?? 0) + 1
  })

  const venueCounts: Record<string, number> = {}
  ;(venues ?? []).forEach((v) => {
    const c = v.city
    venueCounts[c] = (venueCounts[c] ?? 0) + 1
  })

  const cities = [...new Set([...Object.keys(playerCounts), ...Object.keys(venueCounts)])].sort()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">City Health</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cities.map((city) => (
          <Card key={city}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" /> {city}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{playerCounts[city] ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Players</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{venueCounts[city] ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Venues</div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                Ratio: {venueCounts[city] ? `${Math.round((playerCounts[city] ?? 0) / venueCounts[city])} players/venue` : "No venues yet"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, ChevronRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Venues" }

export default async function OwnerVenuesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: adminEntries } = await supabase.from("football_venue_admins").select("venue_id").eq("user_id", user.id)
  const venueIds = (adminEntries ?? []).map((r) => r.venue_id)

  const { data: venues } = await supabase
    .from("football_venues")
    .select(`*, pitches:football_pitches(count)`)
    .in("id", venueIds.length ? venueIds : ["none"])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Venues</h1>
      </div>

      {(venues?.length ?? 0) === 0 ? (
        <p className="text-muted-foreground">No venues assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {venues?.map((v) => (
            <Link key={v.id} href={`/owner/venues/${v.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-sm text-muted-foreground">{v.city}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary">{(v.pitches as unknown as { count: number }[])?.length ?? 0} pitches</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
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

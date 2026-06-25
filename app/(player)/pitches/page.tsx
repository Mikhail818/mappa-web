import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/common/EmptyState"
import { formatCurrency } from "@/lib/utils/format"
import { MapPin, Sun, Zap, ChevronRight } from "lucide-react"
import { PitchFilters } from "./PitchFilters"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Find Pitches" }

export default async function PitchesPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; format?: string; surface?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  let query = supabase
    .from("football_pitches")
    .select(`*, venue:football_venues(id, name, city, address, lat, lng)`)
    .eq("is_active", true)
    .order("name")

  if (sp.format) query = query.eq("format", sp.format)
  if (sp.surface) query = query.eq("surface", sp.surface)

  const { data: pitches } = await query

  let results = pitches ?? []
  if (sp.city) {
    results = results.filter((p) => (p.venue as unknown as { city: string } | null)?.city === sp.city)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Find Pitches</h1>
        <p className="text-muted-foreground text-sm mt-1">Book a football pitch in Cyprus</p>
      </div>

      <PitchFilters initialCity={sp.city} initialFormat={sp.format} initialSurface={sp.surface} />

      <p className="text-sm text-muted-foreground">{results.length} pitch{results.length !== 1 ? "es" : ""} found</p>

      {results.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-7 w-7" />}
          title="No pitches found"
          description="Try adjusting your filters"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((pitch) => {
            const venue = pitch.venue as unknown as { id: string; name: string; city: string; address: string | null } | null
            return (
              <Link key={pitch.id} href={`/pitches/${pitch.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-4 pb-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{pitch.name}</p>
                        <p className="text-xs text-muted-foreground">{venue?.name}</p>
                      </div>
                      <Badge variant="secondary">{pitch.format}</Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {venue?.city}
                      {venue?.address && ` · ${venue.address}`}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                        {pitch.surface.replace("_", " ")}
                      </span>
                      {pitch.indoor && (
                        <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                          <Sun className="h-3 w-3" /> Indoor
                        </span>
                      )}
                      {pitch.floodlights && (
                        <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                          <Zap className="h-3 w-3" /> Floodlights
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {pitch.price_per_hour_cents ? formatCurrency(pitch.price_per_hour_cents) : "Free"}
                        {pitch.price_per_hour_cents ? <span className="text-xs text-muted-foreground font-normal">/hr</span> : ""}
                      </span>
                      <Button size="sm" variant="outline" className="gap-1">
                        Book <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

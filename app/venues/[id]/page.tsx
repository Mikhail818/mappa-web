import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Globe, ChevronLeft } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("football_venues").select("name").eq("id", id).single()
  return { title: data?.name ?? "Venue" }
}

interface Props { params: Promise<{ id: string }> }

export default async function PublicVenuePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: venue } = await supabase
    .from("football_venues")
    .select(`*, pitches:football_pitches(*) `)
    .eq("id", id)
    .single()

  if (!venue) notFound()

  const pitches = venue.pitches as unknown as {
    id: string; name: string; format: string; price_per_hour_cents: number | null; is_active: boolean
  }[]

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Link href="/pitches" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> All Venues
        </Link>

        <div>
          <h1 className="text-3xl font-bold">{venue.name}</h1>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{venue.address ? `${venue.address}, ` : ""}{venue.city}</span>
          </div>
        </div>

        {venue.description && <p className="text-muted-foreground">{venue.description}</p>}

        <div className="flex flex-wrap gap-2 text-sm">
          {venue.phone && (
            <a href={`tel:${venue.phone}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <Phone className="h-4 w-4" /> {venue.phone}
            </a>
          )}
          {venue.website && (
            <a href={venue.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
              <Globe className="h-4 w-4" /> Website
            </a>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3">Pitches ({pitches.length})</h2>
          <div className="space-y-3">
            {pitches.filter((p) => p.is_active).map((p) => (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{p.format}</Badge>
                      {p.price_per_hour_cents && (
                        <span className="font-semibold text-primary">{formatCurrency(p.price_per_hour_cents)}/hr</span>
                      )}
                      <Link href={`/courts/${p.id}`} className={buttonVariants({ size: "sm" })}>View</Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

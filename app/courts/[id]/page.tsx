import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, ChevronLeft, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("football_pitches").select("name").eq("id", id).single()
  return { title: data?.name ?? "Pitch" }
}

interface Props { params: Promise<{ id: string }> }

export default async function PublicCourtPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: pitch } = await supabase
    .from("football_pitches")
    .select(`*, venue:football_venues(*), availability:football_pitch_availabilities(*)`)
    .eq("id", id)
    .single()

  if (!pitch) notFound()

  const venue = pitch.venue as unknown as { id: string; name: string; city: string; address: string | null } | null
  const availability = (pitch.availability as unknown as { day_of_week: number; open_time: string; close_time: string }[]) ?? []

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Link href={`/venues/${venue?.id}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> {venue?.name}
        </Link>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{pitch.name}</h1>
            <Badge variant="outline">{pitch.format}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{venue?.city}</span>
          </div>
        </div>


        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                {pitch.price_per_hour_cents && (
                  <p className="text-2xl font-bold text-primary">{formatCurrency(pitch.price_per_hour_cents)}<span className="text-sm font-normal text-muted-foreground">/hour</span></p>
                )}
              </div>
              <Link href={`/book/${pitch.id}`} className={buttonVariants({ size: "lg" })}>Book Now</Link>
            </div>
          </CardContent>
        </Card>

        {availability.length > 0 && (
          <div>
            <h2 className="font-semibold mb-2 flex items-center gap-2"><Clock className="h-4 w-4" /> Opening Hours</h2>
            <div className="space-y-1">
              {availability.sort((a, b) => a.day_of_week - b.day_of_week).map((slot) => (
                <div key={slot.day_of_week} className="flex justify-between text-sm py-1 border-b last:border-0">
                  <span className="font-medium w-28">{DAYS[slot.day_of_week]}</span>
                  <span className="text-muted-foreground">{slot.open_time.slice(0, 5)} – {slot.close_time.slice(0, 5)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

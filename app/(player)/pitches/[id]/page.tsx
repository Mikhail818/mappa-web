import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import { MapPin, Sun, Zap, Clock, Users, ChevronLeft, Calendar } from "lucide-react"
import type { Metadata } from "next"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

interface Props { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Pitch Detail" }

export default async function PitchDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: pitch } = await supabase
    .from("football_pitches")
    .select(`*, venue:football_venues(*), availability:football_pitch_availability(*)`)
    .eq("id", id)
    .single()

  if (!pitch) notFound()

  const venue = pitch.venue as unknown as { id: string; name: string; city: string; address: string | null; phone: string | null; website: string | null; description: string | null } | null
  const availability = (pitch.availability as unknown as { day_of_week: number; opens_at: string; closes_at: string; is_active: boolean }[]) ?? []
  const activeAvail = availability.filter((a) => a.is_active)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/pitches" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{pitch.name}</h1>
          <p className="text-muted-foreground text-sm">{venue?.name}</p>
        </div>
      </div>

      {/* Main info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{pitch.format}</Badge>
            <Badge variant="outline">{pitch.surface.replace("_", " ")}</Badge>
            {pitch.indoor && <Badge variant="outline"><Sun className="h-3 w-3 mr-1" />Indoor</Badge>}
            {pitch.floodlights && <Badge variant="outline"><Zap className="h-3 w-3 mr-1" />Floodlights</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{venue?.city}{venue?.address ? `, ${venue.address}` : ""}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Up to {pitch.capacity_players} players</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Min {pitch.min_booking_minutes} min</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-3xl font-bold text-primary">
                {pitch.price_per_hour_cents ? formatCurrency(pitch.price_per_hour_cents) : "Free"}
              </span>
              {pitch.price_per_hour_cents && <span className="text-muted-foreground text-sm">/hour</span>}
            </div>
            <Link href={`/book/${pitch.id}`} className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
              <Calendar className="h-4 w-4" /> Book Now
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      {activeAvail.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Opening Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => {
              const slot = activeAvail.find((a) => a.day_of_week === day)
              return (
                <div key={day} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground w-28">{DAY_NAMES[day]}</span>
                  <span className={slot ? "font-medium" : "text-muted-foreground"}>
                    {slot ? `${slot.opens_at.slice(0, 5)} – ${slot.closes_at.slice(0, 5)}` : "Closed"}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Venue info */}
      {venue && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">About {venue.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {venue.description && <p className="text-muted-foreground">{venue.description}</p>}
            {venue.phone && <p><span className="text-muted-foreground">Phone: </span>{venue.phone}</p>}
            {venue.website && (
              <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block">
                Visit website
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

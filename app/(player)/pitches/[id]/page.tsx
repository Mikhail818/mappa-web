import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { PageHeader } from "@/components/common/PageHeader"
import { StickyActionBar } from "@/components/common/StickyActionBar"
import { PitchArt } from "@/components/pitches/PitchArt"
import { OpeningHours } from "@/components/pitches/OpeningHours"
import { formatCurrency } from "@/lib/utils/format"
import { mapsUrl, surfaceLabel } from "@/lib/utils/pitch"
import { addDays, formatClock, relativeDayLabel, toDateKey } from "@/lib/utils/time"
import { buildSlots, durationOptions, type AvailabilityWindow, type Slot } from "@/lib/booking/slots"
import { fetchBusyRanges } from "@/lib/booking/busy"
import { cn } from "@/lib/utils"
import { Clock, Globe, Lightbulb, Navigation, Phone, Users, Warehouse, Layers, Sparkles } from "lucide-react"
import type { Metadata } from "next"

interface Props { params: Promise<{ id: string }> }

interface Venue {
  id: string
  name: string
  city: string
  address: string | null
  phone: string | null
  website: string | null
  description: string | null
  lat: number | null
  lng: number | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("football_pitches").select("name").eq("id", id).single()
  return { title: data?.name ?? "Pitch" }
}

const LOOKAHEAD_DAYS = 7

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

  const venue = pitch.venue as unknown as Venue | null
  const availability = (pitch.availability as unknown as AvailabilityWindow[]) ?? []

  // Surface the next few bookable times so most players can skip the calendar entirely.
  const now = new Date()
  const today = toDateKey(now)
  const busy = await fetchBusyRanges(supabase, pitch.id, now, new Date(now.getTime() + (LOOKAHEAD_DAYS + 1) * 86_400_000))
  const duration = durationOptions(pitch.min_booking_minutes)[0]
  const nextSlots: { date: string; slot: Slot }[] = []
  for (let i = 0; i < LOOKAHEAD_DAYS && nextSlots.length < 6; i++) {
    const date = addDays(today, i)
    for (const slot of buildSlots({ date, availability, busy, durationMinutes: duration, stepMinutes: pitch.slot_granularity_minutes, now })) {
      // Prefer on-the-hour starts — they're what most groups book.
      if (slot.available && slot.startMinutes % 60 === 0) nextSlots.push({ date, slot })
      if (nextSlots.length >= 6) break
    }
  }

  const price = pitch.price_per_hour_cents
  const priceLabel = price ? formatCurrency(price) : "Free"

  const facts = [
    { icon: Users, label: "Format", value: `${pitch.format} · up to ${pitch.capacity_players}` },
    { icon: Layers, label: "Surface", value: surfaceLabel(pitch.surface) },
    { icon: pitch.indoor ? Warehouse : Sparkles, label: "Setting", value: pitch.indoor ? "Indoor" : "Outdoor" },
    { icon: Lightbulb, label: "Floodlights", value: pitch.floodlights ? "Yes" : "No" },
    { icon: Clock, label: "Minimum", value: `${pitch.min_booking_minutes} min` },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ href: "/pitches", label: "Pitches" }}
        title={venue?.name ?? pitch.name}
        subtitle={`${pitch.name} · ${venue?.city ?? ""}`}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <PitchArt
            seed={pitch.id}
            surface={pitch.surface}
            indoor={pitch.indoor}
            className="h-52 rounded-3xl shadow-soft sm:h-64"
          >
            <div className="flex h-full items-end p-4">
              <span className="rounded-full bg-black/30 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
                {pitch.format} · {surfaceLabel(pitch.surface)}
              </span>
            </div>
          </PitchArt>

          <section aria-labelledby="next-times" className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 id="next-times" className="text-lg font-semibold">Next available</h2>
              <Link href={`/book/${pitch.id}`} className="text-sm font-medium text-primary">
                All times
              </Link>
            </div>
            {nextSlots.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {nextSlots.map(({ date, slot }) => (
                  <Link
                    key={slot.start.toISOString()}
                    href={`/book/${pitch.id}?date=${date}&time=${formatClock(slot.startMinutes)}`}
                    className="rounded-2xl bg-card px-4 py-3 shadow-soft ring-1 ring-foreground/[0.06] transition-all hover:ring-primary/40 active:scale-[0.98]"
                  >
                    <p className="text-xs font-medium text-muted-foreground">{relativeDayLabel(slot.start, now)}</p>
                    <p className="text-lg font-semibold tabular-nums">{formatClock(slot.startMinutes)}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-soft ring-1 ring-foreground/[0.06]">
                No open times in the next week. Check the calendar for later dates.
              </p>
            )}
          </section>

          <section aria-labelledby="details" className="space-y-3">
            <h2 id="details" className="text-lg font-semibold">Details</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl bg-card p-4 shadow-soft ring-1 ring-foreground/[0.06]">
                  <Icon className="mb-2 size-5 text-primary" />
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {availability.some((a) => a.is_active) && (
            <section aria-labelledby="hours" className="space-y-3">
              <h2 id="hours" className="text-lg font-semibold">Opening hours</h2>
              <div className="rounded-2xl bg-card px-4 py-1 shadow-soft ring-1 ring-foreground/[0.06]">
                <OpeningHours availability={availability} now={now} />
              </div>
            </section>
          )}

          {venue && (
            <section aria-labelledby="venue" className="space-y-3">
              <h2 id="venue" className="text-lg font-semibold">About {venue.name}</h2>
              <div className="space-y-4 rounded-2xl bg-card p-4 shadow-soft ring-1 ring-foreground/[0.06]">
                {venue.description && <p className="text-[15px] leading-relaxed text-muted-foreground">{venue.description}</p>}
                {venue.address && (
                  <p className="text-sm">
                    {venue.address}, {venue.city}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <a href={mapsUrl(venue)} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                    <Navigation /> Directions
                  </a>
                  {venue.phone && (
                    <a href={`tel:${venue.phone}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                      <Phone /> Call
                    </a>
                  )}
                  {venue.website && (
                    <a href={venue.website} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
                      <Globe /> Website
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <div className="space-y-4 rounded-3xl bg-card p-6 shadow-lift ring-1 ring-foreground/[0.06]">
            <div>
              <p className="text-3xl font-bold tracking-tight">
                {priceLabel}
                {price ? <span className="text-base font-medium text-muted-foreground"> / hour</span> : null}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Pay at the venue · Free cancellation up to 24h before</p>
            </div>
            <Link href={`/book/${pitch.id}`} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
              Choose a time
            </Link>
          </div>
        </aside>
      </div>

      <StickyActionBar className="lg:hidden" always>
        <div className="min-w-0 flex-1">
          <p className="text-lg leading-tight font-bold">
            {priceLabel}
            {price ? <span className="text-sm font-medium text-muted-foreground"> / hour</span> : null}
          </p>
          <p className="truncate text-xs text-muted-foreground">Pay at the venue</p>
        </div>
        <Link href={`/book/${pitch.id}`} className={cn(buttonVariants({ size: "lg" }), "px-8")}>
          Choose a time
        </Link>
      </StickyActionBar>
    </div>
  )
}

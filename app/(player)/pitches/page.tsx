import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { EmptyState } from "@/components/common/EmptyState"
import { PageHeader } from "@/components/common/PageHeader"
import { PitchArt } from "@/components/pitches/PitchArt"
import { formatCurrency } from "@/lib/utils/format"
import { openStatus, surfaceLabel } from "@/lib/utils/pitch"
import type { AvailabilityWindow } from "@/lib/booking/slots"
import { cn } from "@/lib/utils"
import { Lightbulb, MapPin, SearchX } from "lucide-react"
import { PitchFilters } from "./PitchFilters"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Book a pitch" }

interface Venue {
  id: string
  name: string
  city: string
  address: string | null
}

export default async function PitchesPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; format?: string; q?: string; indoor?: string; lights?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  let query = supabase
    .from("football_pitches")
    .select(
      `*, venue:football_venues(id, name, city, address), availability:football_pitch_availability(day_of_week, opens_at, closes_at, is_active, effective_from, effective_to)`,
    )
    .eq("is_active", true)
    .order("name")

  if (sp.format) query = query.eq("format", sp.format)
  if (sp.indoor === "1") query = query.eq("indoor", true)
  if (sp.lights === "1") query = query.eq("floodlights", true)

  const [{ data: pitches }, { data: me }] = await Promise.all([
    query,
    supabase.from("profiles").select("home_city").eq("id", user.id).single(),
  ])

  const q = sp.q?.trim().toLowerCase()
  const homeCity = me?.home_city
  const results = (pitches ?? [])
    .map((p) => ({ ...p, venue: p.venue as unknown as Venue | null }))
    .filter((p) => !sp.city || p.venue?.city === sp.city)
    .filter(
      (p) =>
        !q ||
        [p.name, p.venue?.name, p.venue?.city, p.venue?.address].some((v) => v?.toLowerCase().includes(q)),
    )
    // Pitches in the player's own city first — that's where they'll usually play.
    .sort((a, b) => Number(b.venue?.city === homeCity) - Number(a.venue?.city === homeCity))

  const now = new Date()

  return (
    <div className="group/pitches space-y-5">
      <PageHeader title="Book a pitch" subtitle="Real-time availability across Cyprus." />

      <PitchFilters />

      <div className="transition-opacity group-has-[[data-pending]]/pitches:opacity-50">
        <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
          {results.length} {results.length === 1 ? "pitch" : "pitches"}
          {sp.city ? ` in ${sp.city}` : ""}
        </p>

        {results.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-7" />}
            title="No pitches match"
            description="Try another city or remove a filter — new venues join every week."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((pitch) => {
              const status = openStatus((pitch.availability as unknown as AvailabilityWindow[]) ?? [], now)
              return (
                <Link
                  key={pitch.id}
                  href={`/pitches/${pitch.id}`}
                  className="group overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-foreground/[0.06] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99]"
                >
                  <PitchArt seed={pitch.id} surface={pitch.surface} indoor={pitch.indoor} className="h-36">
                    <div className="flex h-full flex-col justify-between p-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                          {pitch.format}
                        </span>
                        {pitch.floodlights && (
                          <span className="flex size-7 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md" title="Floodlit">
                            <Lightbulb className="size-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="self-end rounded-full bg-white px-3 py-1 text-sm font-bold text-neutral-900 shadow-soft">
                        {pitch.price_per_hour_cents ? (
                          <>
                            {formatCurrency(pitch.price_per_hour_cents)}
                            <span className="font-medium text-neutral-500">/hr</span>
                          </>
                        ) : (
                          "Free"
                        )}
                      </div>
                    </div>
                  </PitchArt>
                  <div className="space-y-1.5 p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="truncate font-semibold">{pitch.venue?.name ?? pitch.name}</h2>
                    </div>
                    <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      {pitch.name} · {pitch.venue?.city}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 font-medium",
                          status.state === "open" ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            status.state === "open" ? "bg-primary" : status.state === "later" ? "bg-amber-500" : "bg-muted-foreground/50",
                          )}
                        />
                        {status.label}
                      </span>
                      <span className="text-muted-foreground/50">·</span>
                      <span className="text-muted-foreground">{surfaceLabel(pitch.surface)}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

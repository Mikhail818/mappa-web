import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { PublicHeader } from "@/components/layout/PublicHeader"
import { PitchArt } from "@/components/pitches/PitchArt"
import { formatCurrency } from "@/lib/utils/format"
import { mapsUrl, surfaceLabel } from "@/lib/utils/pitch"
import { ChevronRight, Globe, MapPin, Navigation, Phone } from "lucide-react"
import type { Metadata } from "next"

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("football_venues").select("name, city, description").eq("id", id).single()
  return {
    title: data?.name ?? "Venue",
    description: data?.description ?? (data ? `Book a football pitch at ${data.name}, ${data.city}.` : undefined),
  }
}

export default async function PublicVenuePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: venue }, { data: { user } }] = await Promise.all([
    supabase.from("football_venues").select(`*, pitches:football_pitches(*)`).eq("id", id).single(),
    supabase.auth.getUser(),
  ])

  if (!venue) notFound()

  const pitches = (venue.pitches as unknown as {
    id: string; name: string; format: string; surface: string; indoor: boolean; floodlights: boolean
    price_per_hour_cents: number | null; is_active: boolean
  }[]).filter((p) => p.is_active)

  return (
    <main className="min-h-screen bg-background">
      <PublicHeader signedIn={!!user} />
      <PitchArt seed={venue.id} className="h-56 sm:h-72">
        <div className="mx-auto flex h-full max-w-3xl flex-col justify-end px-4 pb-6 text-white">
          <h1 className="text-4xl font-bold tracking-tight drop-shadow-sm">{venue.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-white/90">
            <MapPin className="size-4" />
            {venue.address ? `${venue.address}, ` : ""}{venue.city}
          </p>
        </div>
      </PitchArt>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-6">
        <div className="flex flex-wrap gap-2">
          <a href={mapsUrl(venue)} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            <Navigation /> Directions
          </a>
          {venue.phone && (
            <a href={`tel:${venue.phone}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Phone /> {venue.phone}
            </a>
          )}
          {venue.website && (
            <a href={venue.website} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Globe /> Website
            </a>
          )}
        </div>

        {venue.description && <p className="text-[17px] leading-relaxed text-muted-foreground">{venue.description}</p>}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Pitches</h2>
          {pitches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pitches are open for booking right now.</p>
          ) : (
            <ul className="divide-y divide-border/70 overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-foreground/[0.06]">
              {pitches.map((p) => (
                <li key={p.id}>
                  <Link href={`/courts/${p.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50">
                    <PitchArt seed={p.id} surface={p.surface} indoor={p.indoor} className="size-14 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{p.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {p.format} · {surfaceLabel(p.surface)}{p.floodlights ? " · Floodlit" : ""}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold">
                      {p.price_per_hour_cents ? formatCurrency(p.price_per_hour_cents) : "Free"}
                      {p.price_per_hour_cents ? <span className="text-sm font-normal text-muted-foreground">/hr</span> : null}
                    </p>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

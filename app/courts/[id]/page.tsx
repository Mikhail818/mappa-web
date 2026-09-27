import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { PageHeader } from "@/components/common/PageHeader"
import { PublicHeader } from "@/components/layout/PublicHeader"
import { PitchArt } from "@/components/pitches/PitchArt"
import { OpeningHours } from "@/components/pitches/OpeningHours"
import { formatCurrency } from "@/lib/utils/format"
import { surfaceLabel } from "@/lib/utils/pitch"
import type { AvailabilityWindow } from "@/lib/booking/slots"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("football_pitches").select("name").eq("id", id).single()
  return { title: data?.name ?? "Pitch" }
}

export default async function PublicCourtPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: pitch }, { data: { user } }] = await Promise.all([
    supabase
      .from("football_pitches")
      .select(`*, venue:football_venues(*), availability:football_pitch_availability(*)`)
      .eq("id", id)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!pitch) notFound()

  const venue = pitch.venue as unknown as { id: string; name: string; city: string; address: string | null } | null
  const availability = (pitch.availability as unknown as AvailabilityWindow[]) ?? []

  return (
    <main className="min-h-screen bg-background">
      <PublicHeader signedIn={!!user} />
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <PageHeader
          back={venue ? { href: `/venues/${venue.id}`, label: venue.name } : undefined}
          title={pitch.name}
          subtitle={[venue?.name, venue?.city].filter(Boolean).join(" · ")}
        />

        <PitchArt seed={pitch.id} surface={pitch.surface} indoor={pitch.indoor} className="h-48 rounded-3xl shadow-soft">
          <div className="flex h-full items-end p-4">
            <span className="rounded-full bg-black/30 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
              {pitch.format} · {surfaceLabel(pitch.surface)}
              {pitch.floodlights ? " · Floodlit" : ""}
            </span>
          </div>
        </PitchArt>

        <div className="flex items-center justify-between gap-4 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/[0.06]">
          <p className="text-2xl font-bold">
            {pitch.price_per_hour_cents ? formatCurrency(pitch.price_per_hour_cents) : "Free"}
            {pitch.price_per_hour_cents ? <span className="text-sm font-medium text-muted-foreground"> / hour</span> : null}
          </p>
          <Link href={`/book/${pitch.id}`} className={cn(buttonVariants({ size: "lg" }), "px-8")}>Book</Link>
        </div>

        {availability.some((a) => a.is_active) && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Opening hours</h2>
            <div className="rounded-2xl bg-card px-4 py-1 shadow-soft ring-1 ring-foreground/[0.06]">
              <OpeningHours availability={availability} />
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { PageHeader } from "@/components/common/PageHeader"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PitchArt } from "@/components/pitches/PitchArt"
import { formatCurrency } from "@/lib/utils/format"
import { formatDurationMinutes } from "@/lib/booking/slots"
import { mapsUrl } from "@/lib/utils/pitch"
import { formatFullDate, formatTime } from "@/lib/utils/time"
import { cn } from "@/lib/utils"
import { Check, CircleCheck, Info } from "lucide-react"
import { CancelBookingButton } from "./CancelBookingButton"
import { BookingActions } from "./BookingActions"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Booking" }

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ new?: string }>
}

const STEPS = [
  { key: "requested", label: "Requested" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Played" },
]

export default async function BookingDetailPage({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: booking } = await supabase.from("football_bookings").select("*").eq("id", id).single()
  if (!booking || booking.requester_id !== user.id) notFound()

  const { data: rawPitch } = await supabase
    .from("football_pitches")
    .select("name, format, surface, indoor, venue_id")
    .eq("id", booking.pitch_id)
    .single()
  const { data: venue } = rawPitch?.venue_id
    ? await supabase
        .from("football_venues")
        .select("name, city, address, phone, lat, lng")
        .eq("id", rawPitch.venue_id)
        .single()
    : { data: null }

  const start = new Date(booking.starts_at)
  const end = new Date(booking.ends_at)
  const now = new Date()
  const isUpcoming = end > now
  const isLive = ["requested", "confirmed"].includes(booking.status)
  const canCancel = isLive && start > now
  const isCancellable = start.getTime() > now.getTime() + 86_400_000
  const justBooked = sp.new === "1" && booking.status === "requested"

  // A confirmed booking that has finished counts as played.
  const effective = booking.status === "confirmed" && !isUpcoming ? "completed" : booking.status
  const stepIndex = STEPS.findIndex((s) => s.key === effective)

  const venueName = venue?.name ?? "Venue"
  const location = [venue?.name, venue?.address, venue?.city].filter(Boolean).join(", ")
  const when = `${formatFullDate(start)}, ${formatTime(start)}–${formatTime(end)}`

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader back={{ href: "/bookings", label: "Bookings" }} title={justBooked ? "Request sent" : venueName} />

      {justBooked && (
        <div className="flex gap-4 rounded-3xl bg-primary/10 p-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground animate-in zoom-in-50 duration-500">
            <Check className="size-6" strokeWidth={3} />
          </div>
          <div>
            <p className="font-semibold">You&apos;re nearly on the pitch</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {`${venueName} will confirm your request. You'll see the update in Notifications — nothing to pay until you play.`}
            </p>
          </div>
        </div>
      )}

      {/* Ticket */}
      <article className="overflow-hidden rounded-3xl bg-card shadow-lift ring-1 ring-foreground/[0.06]">
        <PitchArt seed={booking.pitch_id} surface={rawPitch?.surface} indoor={rawPitch?.indoor} className="h-28">
          <div className="flex h-full items-start justify-between p-4">
            <div className="text-white">
              <p className="text-lg font-semibold drop-shadow">{venueName}</p>
              <p className="text-sm text-white/80">
                {rawPitch?.name} · {venue?.city}
              </p>
            </div>
            <StatusBadge status={effective} className="bg-white/90 text-neutral-900 dark:bg-white/90 dark:text-neutral-900" />
          </div>
        </PitchArt>

        <div className="space-y-1 p-5">
          <p className="text-sm font-medium text-muted-foreground">{formatFullDate(start)}</p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {formatTime(start)}
            <span className="mx-1.5 font-normal text-muted-foreground">–</span>
            {formatTime(end)}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDurationMinutes(Math.round((end.getTime() - start.getTime()) / 60_000))}
          </p>
        </div>

        {/* Perforation */}
        <div className="relative flex items-center" aria-hidden>
          <span className="absolute -left-3 size-6 rounded-full bg-background" />
          <span className="mx-5 w-full border-t-2 border-dashed border-border" />
          <span className="absolute -right-3 size-6 rounded-full bg-background" />
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 p-5 text-sm">
          <div>
            <dt className="text-muted-foreground">Game</dt>
            <dd className="font-semibold">{booking.format} · {booking.player_count} players</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Total</dt>
            <dd className="font-semibold">
              {booking.total_price_cents ? formatCurrency(booking.total_price_cents) : "Free"}
              <span className="font-normal text-muted-foreground"> · at venue</span>
            </dd>
          </div>
          {booking.contact_name && (
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-semibold">{booking.contact_name}</dd>
            </div>
          )}
          {booking.contact_phone && (
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-semibold">{booking.contact_phone}</dd>
            </div>
          )}
          <div className="col-span-2">
            <dt className="text-muted-foreground">Booking ref</dt>
            <dd className="font-mono text-xs font-semibold tracking-wider uppercase">{booking.id.slice(0, 8)}</dd>
          </div>
        </dl>
      </article>

      {/* Progress */}
      {stepIndex >= 0 && (
        <ol className="flex items-center" aria-label="Booking progress">
          {STEPS.map((step, i) => {
            const done = i <= stepIndex
            return (
              <li key={step.key} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                      done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={cn("text-xs font-medium", done ? "text-foreground" : "text-muted-foreground")}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className={cn("mx-2 mb-5 h-0.5 flex-1 rounded-full", i < stepIndex ? "bg-primary" : "bg-muted")} />
                )}
              </li>
            )
          })}
        </ol>
      )}

      {!isLive && booking.status !== "completed" && (
        <div className="flex gap-3 rounded-2xl bg-muted p-4 text-sm">
          <Info className="size-5 shrink-0 text-muted-foreground" />
          <p>
            {booking.status === "declined"
              ? "The venue couldn't take this booking. Try another time or a nearby pitch."
              : "This booking was cancelled."}
          </p>
        </div>
      )}

      <BookingActions
        bookingId={booking.id}
        title={`Football at ${venueName}`}
        location={location}
        startsAt={booking.starts_at}
        endsAt={booking.ends_at}
        mapsHref={mapsUrl(venue ?? {})}
        phone={venue?.phone}
        showCalendar={isLive && isUpcoming}
        shareText={`⚽ ${booking.format} at ${venueName} (${rawPitch?.name})\n${when}\n${location}`}
      />

      {(booking.venue_notes || booking.notes) && (
        <div className="space-y-3">
          {booking.venue_notes && (
            <div className="flex gap-3 rounded-2xl bg-card p-4 shadow-soft ring-1 ring-foreground/[0.06]">
              <CircleCheck className="size-5 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-semibold">From {venueName}</p>
                <p className="mt-0.5 text-muted-foreground">{booking.venue_notes}</p>
              </div>
            </div>
          )}
          {booking.notes && (
            <div className="rounded-2xl bg-card p-4 text-sm shadow-soft ring-1 ring-foreground/[0.06]">
              <p className="font-semibold">Your note</p>
              <p className="mt-0.5 text-muted-foreground">{booking.notes}</p>
            </div>
          )}
        </div>
      )}

      {canCancel && (
        <div className="pt-2">
          <CancelBookingButton bookingId={booking.id} userId={user.id} isCancellable={isCancellable} />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {isCancellable ? "Free cancellation until 24 hours before kick-off." : "Less than 24 hours to go — the venue may charge a late fee."}
          </p>
        </div>
      )}
    </div>
  )
}

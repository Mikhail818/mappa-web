import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { StatusBadge } from "@/components/common/StatusBadge"
import { formatDate, formatCurrency, formatDuration } from "@/lib/utils/format"
import { MapPin, Phone, Clock, Users, ChevronLeft } from "lucide-react"
import { CancelBookingButton } from "./CancelBookingButton"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Booking Detail" }
interface Props { params: Promise<{ id: string }> }

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: booking } = await supabase
    .from("football_bookings")
    .select("*")
    .eq("id", id)
    .single()

  if (!booking || booking.requester_id !== user.id) notFound()

  const { data: rawPitch } = await supabase.from("football_pitches").select("name, format, venue_id").eq("id", booking.pitch_id).single()
  const { data: venueData } = rawPitch?.venue_id
    ? await supabase.from("football_venues").select("name, city, address, phone").eq("id", rawPitch.venue_id).single()
    : { data: null }

  const pitch = rawPitch ? { ...rawPitch, venue: venueData } : null
  const canCancel = ["requested", "confirmed"].includes(booking.status)
  const isCancellable = booking.starts_at > new Date(Date.now() + 86400 * 1000).toISOString()

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/bookings" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">Booking Detail</h1>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <StatusBadge status={booking.status} />
            {booking.total_price_cents && (
              <span className="text-xl font-bold text-primary">{formatCurrency(booking.total_price_cents)}</span>
            )}
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium">{pitch?.venue?.name}</span>
            </div>
            <div className="pl-6 text-muted-foreground">{pitch?.name} · {pitch?.format}</div>
            {pitch?.venue?.address && (
              <div className="pl-6 text-muted-foreground">{pitch.venue.address}, {pitch.venue.city}</div>
            )}

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <div>{formatDate(booking.starts_at)}</div>
                <div className="text-muted-foreground">Duration: {formatDuration(booking.starts_at, booking.ends_at)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{booking.player_count} players · {booking.format}</span>
            </div>

            {booking.contact_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{booking.contact_phone}</span>
              </div>
            )}

            {booking.notes && (
              <div className="pt-1">
                <p className="text-muted-foreground text-xs mb-1">Your notes</p>
                <p>{booking.notes}</p>
              </div>
            )}

            {booking.venue_notes && (
              <div className="pt-1 bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground text-xs mb-1">Venue notes</p>
                <p>{booking.venue_notes}</p>
              </div>
            )}
          </div>

          {canCancel && (
            <CancelBookingButton
              bookingId={booking.id}
              userId={user.id}
              isCancellable={isCancellable}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

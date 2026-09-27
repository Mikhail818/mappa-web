import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { addDays, toDateKey } from "@/lib/utils/time"
import { BOOKING_WINDOW_DAYS, type AvailabilityWindow } from "@/lib/booking/slots"
import { BookingFlow } from "./BookingFlow"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Choose a time" }

interface Props {
  params: Promise<{ pitchId: string }>
  searchParams: Promise<{ date?: string; time?: string }>
}

export default async function BookPage({ params, searchParams }: Props) {
  const [{ pitchId }, sp] = await Promise.all([params, searchParams])
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirectTo=/book/${pitchId}`)

  const [{ data: rawPitch }, { data: profile }] = await Promise.all([
    supabase
      .from("football_pitches")
      .select(`*, venue:football_venues(name, city), availability:football_pitch_availability(*)`)
      .eq("id", pitchId)
      .single(),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ])

  if (!rawPitch || !rawPitch.is_active) notFound()

  const now = new Date()
  const today = toDateKey(now)
  const lastDay = addDays(today, BOOKING_WINDOW_DAYS - 1)
  // Deep links from "Next available" arrive with a date and time pre-selected.
  const initialDate = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) && sp.date >= today && sp.date <= lastDay ? sp.date : undefined
  const initialTime = sp.time && /^\d{2}:\d{2}$/.test(sp.time) ? sp.time : undefined

  return (
    <BookingFlow
      pitch={{
        id: rawPitch.id,
        name: rawPitch.name,
        format: rawPitch.format,
        surface: rawPitch.surface,
        indoor: rawPitch.indoor,
        capacity_players: rawPitch.capacity_players,
        price_per_hour_cents: rawPitch.price_per_hour_cents,
        min_booking_minutes: rawPitch.min_booking_minutes,
        slot_granularity_minutes: rawPitch.slot_granularity_minutes,
        venue: rawPitch.venue as unknown as { name: string; city: string } | null,
      }}
      availability={(rawPitch.availability as unknown as AvailabilityWindow[]) ?? []}
      userId={user.id}
      defaultName={profile?.full_name ?? ""}
      nowIso={now.toISOString()}
      initialDate={initialDate}
      initialTime={initialTime}
    />
  )
}

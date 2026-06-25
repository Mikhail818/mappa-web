import { createClient } from "@/lib/supabase/client"

export async function fetchMyBookings(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("football_bookings")
    .select(`*, pitch:football_pitches(*, venue:football_venues(*))`)
    .eq("requester_id", userId)
    .order("starts_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchBookingById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("football_bookings")
    .select(`*, pitch:football_pitches(*, venue:football_venues(*)), players:football_booking_players(*)`)
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function fetchPitchBookings(pitchId: string, from: string, to: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("football_bookings")
    .select("starts_at, ends_at, status")
    .eq("pitch_id", pitchId)
    .in("status", ["requested", "confirmed"])
    .gte("starts_at", from)
    .lte("ends_at", to)
  if (error) throw error
  return data ?? []
}

export async function requestBooking(payload: {
  pitchId: string
  requesterId: string
  startsAt: string
  endsAt: string
  format: string
  playerCount: number
  totalPriceCents?: number
  contactName?: string
  contactPhone?: string
  notes?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("football_bookings")
    .insert({
      pitch_id: payload.pitchId,
      requester_id: payload.requesterId,
      starts_at: payload.startsAt,
      ends_at: payload.endsAt,
      format: payload.format,
      player_count: payload.playerCount,
      total_price_cents: payload.totalPriceCents,
      contact_name: payload.contactName,
      contact_phone: payload.contactPhone,
      notes: payload.notes,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function cancelBooking(bookingId: string, userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("football_bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: userId,
    })
    .eq("id", bookingId)
    .select()
    .single()
  if (error) throw error
  return data
}

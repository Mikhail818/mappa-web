import { createClient } from "@/lib/supabase/client"

export async function fetchOwnerVenues(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("football_venue_admins")
    .select(`venue:football_venues(*, pitches:football_pitches(*))`)
    .eq("user_id", userId)
  if (error) throw error
  return (data ?? []).map((r) => r.venue).filter(Boolean)
}

export async function fetchOwnerBookings(userId: string) {
  const supabase = createClient()
  // Get all venues the user manages
  const { data: adminData, error: adminErr } = await supabase
    .from("football_venue_admins")
    .select("venue_id")
    .eq("user_id", userId)
  if (adminErr) throw adminErr

  const venueIds = (adminData ?? []).map((r) => r.venue_id)
  if (!venueIds.length) return []

  const { data: pitchData, error: pitchErr } = await supabase
    .from("football_pitches")
    .select("id")
    .in("venue_id", venueIds)
  if (pitchErr) throw pitchErr

  const pitchIds = (pitchData ?? []).map((r) => r.id)
  if (!pitchIds.length) return []

  const { data, error } = await supabase
    .from("football_bookings")
    .select(`*, pitch:football_pitches(*, venue:football_venues(*)), requester:profiles!football_bookings_requester_id_fkey(*)`)
    .in("pitch_id", pitchIds)
    .order("starts_at", { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function confirmBooking(bookingId: string, venueNotes?: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("confirm_football_booking", {
    p_booking_id: bookingId,
    p_venue_notes: venueNotes,
  })
  if (error) throw error
  return data
}

export async function declineBooking(bookingId: string, userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("football_bookings")
    .update({
      status: "declined",
      cancelled_at: new Date().toISOString(),
      cancelled_by: userId,
    })
    .eq("id", bookingId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchOwnerAnalytics(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("owner_booking_analytics")
    .select("*")
    .eq("owner_id", userId)
    .order("starts_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BookingsTable } from "@/components/owner/BookingsTable"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Booking Requests" }

export default async function OwnerBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: adminEntries } = await supabase.from("football_venue_admins").select("venue_id").eq("user_id", user.id)
  const venueIds = (adminEntries ?? []).map((r) => r.venue_id)
  const { data: pitchRows } = await supabase.from("football_pitches").select("id").in("venue_id", venueIds.length ? venueIds : ["none"])
  const pitchIds = (pitchRows ?? []).map((r) => r.id)

  const { data: bookings } = await supabase
    .from("football_bookings")
    .select(`*, pitch:football_pitches(name, venue:football_venues(name, city)), requester:profiles!football_bookings_requester_id_fkey(full_name, email)`)
    .in("pitch_id", pitchIds.length ? pitchIds : ["none"])
    .order("starts_at", { ascending: true })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Booking Requests</h1>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <BookingsTable bookings={(bookings ?? []) as any} ownerId={user.id} />
    </div>
  )
}

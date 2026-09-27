import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BookingsTable } from "@/components/owner/BookingsTable"
import { PageHeader } from "@/components/common/PageHeader"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Bookings" }

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
      <PageHeader title="Bookings" subtitle="Confirm requests quickly — players are waiting to hear back." />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <BookingsTable bookings={(bookings ?? []) as any} ownerId={user.id} nowIso={new Date().toISOString()} />
    </div>
  )
}

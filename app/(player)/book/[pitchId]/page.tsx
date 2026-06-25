import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { BookingFlow } from "./BookingFlow"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Book Pitch" }

interface Props { params: Promise<{ pitchId: string }> }

export default async function BookPage({ params }: Props) {
  const { pitchId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: rawPitch }, { data: profile }] = await Promise.all([
    supabase.from("football_pitches").select("*").eq("id", pitchId).single(),
    supabase.from("profiles").select("full_name, email").eq("id", user.id).single(),
  ])

  if (!rawPitch) notFound()

  const { data: venue } = await supabase.from("football_venues").select("name, city").eq("id", rawPitch.venue_id).single()

  const pitch = { ...rawPitch, venue }

  return <BookingFlow pitch={pitch} userId={user.id} profile={profile} />
}

import { createClient } from "@/lib/supabase/client"

export async function fetchFootballVenues(city?: string) {
  const supabase = createClient()
  let query = supabase
    .from("football_venues")
    .select(`*, pitches:football_pitches(*)`)
    .eq("is_active", true)
    .order("name")

  if (city) query = query.eq("city", city)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchVenueById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("football_venues")
    .select(`*, pitches:football_pitches(*, availability:football_pitch_availability(*))`)
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function fetchPitches(filters?: { city?: string; format?: string; surface?: string; indoor?: boolean }) {
  const supabase = createClient()
  let query = supabase
    .from("football_pitches")
    .select(`*, venue:football_venues(*)`)
    .eq("is_active", true)
    .order("name")

  if (filters?.format) query = query.eq("format", filters.format)
  if (filters?.surface) query = query.eq("surface", filters.surface)
  if (filters?.indoor !== undefined) query = query.eq("indoor", filters.indoor)

  const { data, error } = await query
  if (error) throw error

  let results = data ?? []
  if (filters?.city) {
    results = results.filter((p) => (p.venue as unknown as { city: string } | null)?.city === filters.city)
  }
  return results
}

export async function fetchPitchById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("football_pitches")
    .select(`*, venue:football_venues(*), availability:football_pitch_availability(*), blackouts:football_pitch_blackouts(*)`)
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

import { createClient } from "@/lib/supabase/client"

export interface PlayerFilters {
  city?: string
  skillLevel?: string[]
  availability?: string[]
  page?: number
  pageSize?: number
}

export async function fetchPlayers(filters: PlayerFilters = {}) {
  const supabase = createClient()
  const { city, skillLevel, availability, page = 0, pageSize = 20 } = filters

  let query = supabase
    .from("profiles")
    .select("*")
    .eq("onboarding_completed", true)
    .order("matchmaking_rating", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (city) query = query.eq("home_city", city)
  if (skillLevel?.length) query = query.in("skill_level", skillLevel)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchPlayerById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function fetchPlayerCount() {
  const supabase = createClient()
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("onboarding_completed", true)
  if (error) throw error
  return count ?? 0
}

export async function fetchPlayerCities() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("home_city")
    .eq("onboarding_completed", true)
  if (error) throw error
  return [...new Set((data ?? []).map((r) => r.home_city))].sort()
}

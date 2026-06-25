import { createClient } from "@/lib/supabase/client"

export async function fetchNorthStarMetrics() {
  const supabase = createClient()
  const [profiles, matches, applications] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("onboarding_completed", true),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("venue_owner_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ])
  return {
    activePlayers: profiles.count ?? 0,
    completedMatches: matches.count ?? 0,
    pendingApplications: applications.count ?? 0,
  }
}

export async function fetchCityHealth() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("home_city")
    .eq("onboarding_completed", true)
  if (error) throw error

  const counts: Record<string, number> = {}
  for (const p of data ?? []) {
    counts[p.home_city] = (counts[p.home_city] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([city, players]) => ({ city, players }))
    .sort((a, b) => b.players - a.players)
}

export async function fetchAllPlayers() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchNewSignups(days = 30) {
  const supabase = createClient()
  const since = new Date(Date.now() - days * 86400 * 1000).toISOString()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchVenueOwnerApplications() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("venue_owner_applications")
    .select(`*, user:profiles(*)`)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function approveApplication(adminId: string, applicationId: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc("approve_owner_application", {
    p_admin_id: adminId,
    p_application_id: applicationId,
  })
  if (error) throw error
}

export async function rejectApplication(adminId: string, applicationId: string, notes?: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc("reject_owner_application", {
    p_admin_id: adminId,
    p_application_id: applicationId,
    p_notes: notes,
  })
  if (error) throw error
}

export async function fetchActivationFunnel() {
  const supabase = createClient()
  const [total, onboarded, matched] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("onboarding_completed", true),
    supabase.from("matches").select("player_id").eq("status", "completed"),
  ])
  const uniqueMatchedPlayers = new Set([...(matched.data ?? []).map((m) => m.player_id)]).size
  return {
    signups: total.count ?? 0,
    onboarded: onboarded.count ?? 0,
    firstMatch: uniqueMatchedPlayers,
  }
}

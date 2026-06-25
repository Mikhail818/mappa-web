import { createClient } from "@/lib/supabase/client"

export async function fetchOpenMatches() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("open_matches")
    .select(`*, creator:profiles!open_matches_creator_id_fkey(*), court:courts(*), joins:open_match_joins(*, user:profiles(*))`)
    .eq("status", "open")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchOpenMatchById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("open_matches")
    .select(`*, creator:profiles!open_matches_creator_id_fkey(*), court:courts(*), joins:open_match_joins(*, user:profiles(*))`)
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function createOpenMatch(payload: {
  creatorId: string
  scheduledAt: string
  matchType: string
  maxPlayers: number
  courtId?: string
  notes?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("open_matches")
    .insert({
      creator_id: payload.creatorId,
      scheduled_at: payload.scheduledAt,
      match_type: payload.matchType,
      max_players: payload.maxPlayers,
      court_id: payload.courtId,
      notes: payload.notes,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function joinOpenMatch(openMatchId: string, userId: string, slotIndex: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("open_match_joins")
    .insert({ open_match_id: openMatchId, user_id: userId, slot_index: slotIndex })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function leaveOpenMatch(openMatchId: string, userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("open_match_joins")
    .delete()
    .eq("open_match_id", openMatchId)
    .eq("user_id", userId)
  if (error) throw error
}

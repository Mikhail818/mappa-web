import { createClient } from "@/lib/supabase/client"
import type { TablesInsert } from "@/types/database.types"

export async function fetchUserMatches(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("matches")
    .select(
      `*, player:profiles!matches_player_id_fkey(*), opponent:profiles!matches_opponent_id_fkey(*), court:courts(*)`,
    )
    .or(`player_id.eq.${userId},opponent_id.eq.${userId}`)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchMatchById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("matches")
    .select(
      `*, player:profiles!matches_player_id_fkey(*), opponent:profiles!matches_opponent_id_fkey(*), court:courts(*)`,
    )
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function createMatchRequest(
  playerId: string,
  opponentId: string,
  opts: { courtId?: string; scheduledAt?: string; notes?: string },
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("matches")
    .insert({
      player_id: playerId,
      opponent_id: opponentId,
      status: "pending",
      court_id: opts.courtId,
      scheduled_at: opts.scheduledAt,
      notes: opts.notes,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function submitScore(
  matchId: string,
  submitterId: string,
  playerSets: number,
  opponentSets: number,
  scoreSets?: object,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("matches")
    .update({
      player_sets: playerSets,
      opponent_sets: opponentSets,
      score_sets: (scoreSets ?? null) as never,
      score_submitted_by: submitterId,
      status: "completed",
    })
    .eq("id", matchId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function disputeScore(
  matchId: string,
  disputedBy: string,
  playerSets: number,
  opponentSets: number,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("matches")
    .update({
      status: "disputed",
      disputed_by: disputedBy,
      disputed_at: new Date().toISOString(),
      dispute_player_sets: playerSets,
      dispute_opponent_sets: opponentSets,
    })
    .eq("id", matchId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function acceptMatchRequest(matchId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("matches")
    .update({ status: "confirmed" })
    .eq("id", matchId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function cancelMatch(matchId: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc("cancel_match", { match_id: matchId })
  if (error) throw error
}

import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export async function fetchMatchMessages(matchId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("match_messages")
    .select(`*, sender:profiles(*)`)
    .eq("match_id", matchId)
    .order("created_at", { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function sendMatchMessage(matchId: string, senderId: string, content: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("match_messages")
    .insert({ match_id: matchId, sender_id: senderId, content })
    .select(`*, sender:profiles(*)`)
    .single()
  if (error) throw error
  return data
}

export function subscribeToMatchMessages(
  matchId: string,
  onMessage: (msg: Record<string, unknown>) => void,
): RealtimeChannel {
  const supabase = createClient()
  return supabase
    .channel(`match:${matchId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "match_messages", filter: `match_id=eq.${matchId}` },
      (payload) => onMessage(payload.new as Record<string, unknown>),
    )
    .subscribe()
}

export async function fetchLobbyMessages(openMatchId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("open_match_messages")
    .select(`*, sender:profiles(*)`)
    .eq("open_match_id", openMatchId)
    .order("created_at", { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function sendLobbyMessage(openMatchId: string, senderId: string, content: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("open_match_messages")
    .insert({ open_match_id: openMatchId, sender_id: senderId, content })
    .select(`*, sender:profiles(*)`)
    .single()
  if (error) throw error
  return data
}

export function subscribeToLobbyMessages(
  openMatchId: string,
  onMessage: (msg: Record<string, unknown>) => void,
): RealtimeChannel {
  const supabase = createClient()
  return supabase
    .channel(`lobby:${openMatchId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "open_match_messages", filter: `open_match_id=eq.${openMatchId}` },
      (payload) => onMessage(payload.new as Record<string, unknown>),
    )
    .subscribe()
}

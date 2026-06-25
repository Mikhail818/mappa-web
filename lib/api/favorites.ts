import { createClient } from "@/lib/supabase/client"

export async function fetchFavorites(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("player_favorites")
    .select("player_id")
    .eq("user_id", userId)
  if (error) throw error
  return (data ?? []).map((r) => r.player_id)
}

export async function addFavorite(userId: string, playerId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("player_favorites")
    .insert({ user_id: userId, player_id: playerId })
  if (error) throw error
}

export async function removeFavorite(userId: string, playerId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("player_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("player_id", playerId)
  if (error) throw error
}

export async function toggleFavorite(userId: string, playerId: string, isFav: boolean) {
  if (isFav) return removeFavorite(userId, playerId)
  return addFavorite(userId, playerId)
}

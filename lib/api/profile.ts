import { createClient } from "@/lib/supabase/client"
import type { TablesUpdate } from "@/types/database.types"

export async function fetchProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: TablesUpdate<"profiles">) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function completeOnboarding(
  userId: string,
  updates: TablesUpdate<"profiles">,
) {
  return updateProfile(userId, { ...updates, onboarding_completed: true })
}

export async function checkOwnerStatus(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from("venue_owner_applications")
    .select("status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.status ?? null
}

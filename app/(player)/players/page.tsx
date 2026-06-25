import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PlayersGrid } from "./PlayersGrid"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Find Players" }

export default async function PlayersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { data: players }, { data: favData }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("profiles")
      .select("*")
      .eq("onboarding_completed", true)
      .neq("id", user.id)
      .order("matchmaking_rating", { ascending: false })
      .limit(40),
    supabase.from("player_favorites").select("player_id").eq("user_id", user.id),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Find Players</h1>
        <p className="text-muted-foreground text-sm mt-1">Discover opponents in Cyprus</p>
      </div>
      <PlayersGrid
        currentUser={profile!}
        initialPlayers={players ?? []}
        initialFavs={(favData ?? []).map((r) => r.player_id)}
      />
    </div>
  )
}

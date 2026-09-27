import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/common/PageHeader"
import { PlayersGrid } from "./PlayersGrid"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Players" }

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
      .limit(200),
    supabase.from("player_favorites").select("player_id").eq("user_id", user.id),
  ])

  if (!profile) redirect("/onboarding")

  return (
    <div className="space-y-5">
      <PageHeader title="Players" subtitle="Find someone at your level for a 1v1." />
      <PlayersGrid
        currentUser={profile}
        players={players ?? []}
        initialFavs={(favData ?? []).map((r) => r.player_id)}
      />
    </div>
  )
}

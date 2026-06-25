import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { SkillBadge } from "@/components/common/SkillBadge"
import { formatTimeAgo } from "@/lib/utils/format"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Player Management" }

export default async function AdminPlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, home_city, skill_level, created_at, wins, losses, is_founding_player, onboarding_completed")
    .order("created_at", { ascending: false })
    .limit(100)

  if (q) query = query.ilike("full_name", `%${q}%`)

  const { data: players } = await query

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Player Management</h1>
      <form>
        <input
          name="q"
          defaultValue={q}
          className="w-full max-w-sm px-3 py-2 text-sm border rounded-lg bg-background"
          placeholder="Search by name…"
        />
      </form>
      <div className="space-y-2">
        {(players ?? []).map((p) => (
          <Card key={p.id}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                  {(p.full_name ?? "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{p.full_name}</p>
                    {p.is_founding_player && (
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Founder</span>
                    )}
                    {!p.onboarding_completed && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Not onboarded</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.email} · {p.home_city}</p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <SkillBadge level={p.skill_level ?? ""} />
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(p.created_at)}</p>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 text-right">
                  <div>{p.wins}W / {p.losses}L</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

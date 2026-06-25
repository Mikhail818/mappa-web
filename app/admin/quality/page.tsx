import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/common/StatusBadge"
import { formatDate } from "@/lib/utils/format"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Quality & Safety" }

export default async function AdminQualityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: disputed }, { count: totalMatches }] = await Promise.all([
    supabase
      .from("matches")
      .select(`id, status, scheduled_at, player_sets, opponent_sets, player:profiles!matches_player_id_fkey(full_name), opponent:profiles!matches_opponent_id_fkey(full_name)`)
      .eq("status", "disputed")
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase.from("matches").select("id", { count: "exact", head: true }).eq("status", "completed"),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quality &amp; Safety</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-3xl font-bold text-yellow-500">{disputed?.length ?? 0}</div>
            <div className="text-sm text-muted-foreground">Disputed Matches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-3xl font-bold text-primary">{totalMatches ?? 0}</div>
            <div className="text-sm text-muted-foreground">Completed Matches</div>
          </CardContent>
        </Card>
      </div>

      {(disputed?.length ?? 0) > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Disputed Matches</h2>
          {disputed?.map((m) => {
            const player = m.player as unknown as { full_name: string } | null
            const opponent = m.opponent as unknown as { full_name: string } | null
            return (
              <Card key={m.id}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{player?.full_name} vs {opponent?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Score: {m.player_sets ?? "?"} – {m.opponent_sets ?? "?"} · {formatDate(m.scheduled_at ?? "")}
                      </p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

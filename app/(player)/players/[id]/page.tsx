import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SkillBadge } from "@/components/common/SkillBadge"
import { StatusBadge } from "@/components/common/StatusBadge"
import { formatDateShort, formatTimeAgo } from "@/lib/utils/format"
import { computeMatchFit } from "@/lib/utils/matchFit"
import { MapPin, Star, Zap, Trophy, Swords } from "lucide-react"
import { PlayerActions } from "./PlayerActions"
import type { Metadata } from "next"

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("profiles").select("full_name").eq("id", id).single()
  return { title: data?.full_name ?? "Player Profile" }
}

export default async function PlayerProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: player }, { data: viewer }, { data: headToHead }, { data: favData }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("matches")
      .select("*")
      .or(`and(player_id.eq.${user.id},opponent_id.eq.${id}),and(player_id.eq.${id},opponent_id.eq.${user.id})`)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("player_favorites").select("player_id").eq("user_id", user.id).eq("player_id", id).maybeSingle(),
  ])

  if (!player) notFound()

  const initials = player.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
  const matchFit = viewer ? computeMatchFit(viewer, player) : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={player.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold">{player.full_name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <SkillBadge level={player.skill_level} />
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />{player.home_city}
                </span>
                {player.last_active_at && (
                  <span className="text-xs text-muted-foreground">Active {formatTimeAgo(player.last_active_at)}</span>
                )}
              </div>
              {player.bio && <p className="text-sm text-muted-foreground mt-2">{player.bio}</p>}
            </div>
          </div>

          {matchFit !== null && (
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">Match Fit Score</span>
                <span className={`font-bold text-lg ${matchFit >= 70 ? "text-primary" : matchFit >= 50 ? "text-amber-600" : "text-muted-foreground"}`}>
                  {matchFit}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${matchFit}%` }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Wins", value: player.wins, icon: <Trophy className="h-4 w-4 text-amber-500" /> },
          { label: "Losses", value: player.losses, icon: <Swords className="h-4 w-4 text-red-500" /> },
          { label: "Rating", value: Number(player.rating).toFixed(1), icon: <Star className="h-4 w-4 text-yellow-500" /> },
          { label: "Reliability", value: `${Math.round(Number(player.reliability_score))}%`, icon: <Zap className="h-4 w-4 text-primary" /> },
        ].map(({ label, value, icon }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">{icon} {label}</div>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Head-to-head */}
      {headToHead && headToHead.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Head-to-Head History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {headToHead.map((m) => {
              const youWon = m.score_submitted_by === user.id
                ? (m.player_sets ?? 0) > (m.opponent_sets ?? 0)
                : (m.opponent_sets ?? 0) > (m.player_sets ?? 0)
              return (
                <div key={m.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                  <span className="text-muted-foreground">{formatDateShort(m.created_at)}</span>
                  <span className={`font-medium ${youWon ? "text-primary" : "text-muted-foreground"}`}>
                    {youWon ? "You won" : "You lost"}
                  </span>
                  {m.player_sets != null && (
                    <span className="text-muted-foreground">{m.player_sets} – {m.opponent_sets}</span>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {user.id !== player.id && (
        <PlayerActions
          currentUserId={user.id}
          player={player}
          isFav={!!favData}
        />
      )}
    </div>
  )
}

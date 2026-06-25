import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/common/StatusBadge"
import { SkillBadge } from "@/components/common/SkillBadge"
import { MatchChat } from "@/components/matches/MatchChat"
import { MatchActions } from "./MatchActions"
import { formatDate } from "@/lib/utils/format"
import { MapPin, Calendar } from "lucide-react"
import type { Metadata } from "next"

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "Match Detail" }

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: match } = await supabase
    .from("matches")
    .select(`*, player:profiles!matches_player_id_fkey(*), opponent:profiles!matches_opponent_id_fkey(*), court:courts(*)`)
    .eq("id", id)
    .single()

  if (!match) notFound()

  const isPlayer = match.player_id === user.id
  const me = isPlayer ? match.player : match.opponent
  const opponent = isPlayer ? match.opponent : match.player
  const opponentInitials = (opponent as unknown as { full_name: string } | null)?.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
  const court = match.court as unknown as { name: string; city: string; address: string | null } | null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Match header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <StatusBadge status={match.status} />
            {match.scheduled_at && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {formatDate(match.scheduled_at)}
              </span>
            )}
          </div>

          {/* Players */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center flex-1">
              <Avatar className="h-16 w-16 mx-auto">
                <AvatarImage src={(me as unknown as { avatar_url?: string | null } | null)?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {(me as unknown as { full_name: string } | null)?.full_name?.[0] ?? "?"}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold mt-2">{(me as unknown as { full_name: string } | null)?.full_name}</p>
              <SkillBadge level={(me as unknown as { skill_level: string } | null)?.skill_level ?? ""} />
            </div>
            <div className="text-center">
              {match.status === "completed" && match.player_sets != null ? (
                <div className="text-3xl font-bold">
                  {isPlayer ? match.player_sets : match.opponent_sets}
                  <span className="text-muted-foreground mx-2">–</span>
                  {isPlayer ? match.opponent_sets : match.player_sets}
                </div>
              ) : (
                <div className="text-2xl font-bold text-muted-foreground">VS</div>
              )}
            </div>
            <div className="text-center flex-1">
              <Avatar className="h-16 w-16 mx-auto">
                <AvatarImage src={(opponent as unknown as { avatar_url?: string | null } | null)?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xl bg-muted text-muted-foreground">{opponentInitials}</AvatarFallback>
              </Avatar>
              <p className="font-semibold mt-2">{(opponent as unknown as { full_name: string } | null)?.full_name}</p>
              <SkillBadge level={(opponent as unknown as { skill_level: string } | null)?.skill_level ?? ""} />
            </div>
          </div>

          {court && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {court.name}, {court.city}
            </div>
          )}

          {match.notes && (
            <p className="mt-3 text-sm text-muted-foreground text-center italic">&ldquo;{match.notes}&rdquo;</p>
          )}
        </CardContent>
      </Card>

      {/* Actions (accept, score, dispute, cancel) */}
      <MatchActions
        match={{
          id: match.id,
          status: match.status,
          player_id: match.player_id,
          opponent_id: match.opponent_id,
        }}
        currentUserId={user.id}
      />

      {/* Chat */}
      {["confirmed", "pending", "completed"].includes(match.status) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchChat matchId={match.id} currentUserId={user.id} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/common/StatusBadge"
import { formatDate } from "@/lib/utils/format"
import { MapPin, Calendar, Users } from "lucide-react"
import { LobbyActions } from "./LobbyActions"
import { LobbyChat } from "./LobbyChat"
import type { Metadata } from "next"

interface Props { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Lobby" }

export default async function LobbyPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: lobby } = await supabase
    .from("open_matches")
    .select(`*, creator:profiles!open_matches_creator_id_fkey(*), court:courts(*), joins:open_match_joins(*, user:profiles(*))`)
    .eq("id", id)
    .single()

  if (!lobby) notFound()

  type JoinRow = { id: string; user_id: string; user: { full_name: string; avatar_url: string | null } | null }
  const joins = (lobby.joins as unknown as JoinRow[]) ?? []
  const spotsLeft = lobby.max_players - joins.length
  const hasJoined = joins.some((j) => j.user_id === user.id)
  const isCreator = lobby.creator_id === user.id
  const court = lobby.court as unknown as { name: string; city: string } | null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">{lobby.match_type} · {lobby.max_players}v{lobby.max_players}</h1>
              <p className="text-sm text-muted-foreground">
                by {(lobby.creator as unknown as { full_name: string } | null)?.full_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={lobby.status} />
              <Badge variant={spotsLeft > 0 ? "default" : "secondary"}>
                {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
              </Badge>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" /> {formatDate(lobby.scheduled_at)}
            </div>
            {court && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {court.name}, {court.city}
              </div>
            )}
          </div>

          {lobby.notes && (
            <p className="text-sm text-muted-foreground italic">&ldquo;{lobby.notes}&rdquo;</p>
          )}

          <LobbyActions
            lobbyId={lobby.id}
            currentUserId={user.id}
            hasJoined={hasJoined}
            isCreator={isCreator}
            isFull={spotsLeft === 0}
            currentSlot={joins.length}
          />
        </CardContent>
      </Card>

      {/* Players joined */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Players ({joins.length}/{lobby.max_players})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {joins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No players yet — join first!</p>
          ) : (
            joins.map((j) => {
              const initials = j.user?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
              return (
                <div key={j.id} className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={j.user?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{j.user?.full_name}</span>
                  {j.user_id === lobby.creator_id && (
                    <Badge variant="outline" className="text-xs">Host</Badge>
                  )}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Lobby chat */}
      <LobbyChat lobbyId={lobby.id} currentUserId={user.id} />
    </div>
  )
}

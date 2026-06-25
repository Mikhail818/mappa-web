import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/common/EmptyState"
import { formatDate } from "@/lib/utils/format"
import { Users, MapPin, Plus, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Open Lobbies" }

export default async function LobbiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: lobbies } = await supabase
    .from("open_matches")
    .select(`*, creator:profiles!open_matches_creator_id_fkey(full_name, avatar_url), court:courts(name, city), joins:open_match_joins(id, user_id)`)
    .eq("status", "open")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Open Lobbies</h1>
          <p className="text-muted-foreground text-sm mt-1">Join pickup games near you</p>
        </div>
        <Link href="/lobbies/new" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="h-4 w-4" /> Create Lobby
        </Link>
      </div>

      {!lobbies?.length ? (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title="No open lobbies"
          description="Be the first to create a lobby!"
          action={<Link href="/lobbies/new" className={buttonVariants()}>Create Lobby</Link>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lobbies.map((lobby) => {
            const joins = (lobby.joins as unknown as { id: string; user_id: string }[]) ?? []
            const spotsLeft = lobby.max_players - joins.length
            const hasJoined = joins.some((j) => j.user_id === user.id)
            const court = lobby.court as unknown as { name: string; city: string } | null
            const creator = lobby.creator as unknown as { full_name: string } | null

            return (
              <Link key={lobby.id} href={`/lobbies/${lobby.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-4 pb-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{lobby.match_type} · {lobby.max_players}v{lobby.max_players}</p>
                        <p className="text-xs text-muted-foreground">by {creator?.full_name}</p>
                      </div>
                      <Badge variant={spotsLeft > 0 ? "default" : "secondary"}>
                        {spotsLeft > 0 ? `${spotsLeft} spots` : "Full"}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> {formatDate(lobby.scheduled_at)}
                      </div>
                      {court && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" /> {court.name}, {court.city}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {Array.from({ length: Math.min(joins.length, 5) }).map((_, i) => (
                          <div key={i} className="h-6 w-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs text-primary font-bold">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {joins.length}/{lobby.max_players} joined
                      </span>
                      {hasJoined && <Badge variant="outline" className="text-xs ml-auto">Joined</Badge>}
                    </div>

                    {lobby.notes && (
                      <p className="text-xs text-muted-foreground italic truncate">&ldquo;{lobby.notes}&rdquo;</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageHeader } from "@/components/common/PageHeader"
import { formatDate, initialsOf } from "@/lib/utils/format"
import { Calendar, MapPin } from "lucide-react"
import { LobbyActions } from "./LobbyActions"
import { LobbyChat } from "./LobbyChat"
import type { Metadata } from "next"

interface Props { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Open game" }

type Person = { id: string; full_name: string; avatar_url: string | null; skill_level?: string }
type JoinRow = { id: string; user_id: string; slot_index: number; user: Person | null }

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

  const joins = ((lobby.joins as unknown as JoinRow[]) ?? []).sort((a, b) => a.slot_index - b.slot_index)
  const spotsLeft = Math.max(0, lobby.max_players - joins.length)
  const hasJoined = joins.some((j) => j.user_id === user.id)
  const isCreator = lobby.creator_id === user.id
  const court = lobby.court as unknown as { name: string; city: string } | null
  const creator = lobby.creator as unknown as Person | null
  const inGame = hasJoined || isCreator
  const nextSlot = Math.max(-1, ...joins.map((j) => j.slot_index)) + 1
  const people = Object.fromEntries(
    [creator, ...joins.map((j) => j.user)]
      .filter((p): p is Person => !!p)
      .map((p) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }]),
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        back={{ href: "/lobbies", label: "Open games" }}
        title={`${lobby.match_type} · ${lobby.max_players} players`}
        subtitle={`Hosted by ${creator?.full_name ?? "a player"}`}
      />

      <section className="space-y-4 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/[0.06]">
        <div className="space-y-2 text-[15px]">
          <p className="flex items-center gap-2"><Calendar className="size-4 text-muted-foreground" /> {formatDate(lobby.scheduled_at)}</p>
          {court && <p className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" /> {court.name}, {court.city}</p>}
        </div>
        {lobby.notes && <p className="rounded-2xl bg-muted px-4 py-3 text-sm">{lobby.notes}</p>}
        <div>
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-medium">{joins.length} of {lobby.max_players} going</span>
            <span className="text-muted-foreground">{spotsLeft === 0 ? "Full" : `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (joins.length / lobby.max_players) * 100)}%` }} />
          </div>
        </div>
        <LobbyActions
          lobbyId={lobby.id}
          currentUserId={user.id}
          hasJoined={hasJoined}
          isCreator={isCreator}
          isFull={spotsLeft === 0}
          nextSlot={nextSlot}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Who&apos;s playing</h2>
        {joins.length === 0 ? (
          <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-soft ring-1 ring-foreground/[0.06]">No one yet — be the first in.</p>
        ) : (
          <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-foreground/[0.06]">
            {joins.map((j) => (
              <li key={j.id}>
                <Link href={j.user_id === user.id ? "/profile" : `/players/${j.user_id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
                  <Avatar className="size-9">
                    <AvatarImage src={j.user?.avatar_url ?? undefined} alt="" />
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initialsOf(j.user?.full_name)}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate font-medium">{j.user_id === user.id ? "You" : j.user?.full_name}</span>
                  {j.user_id === lobby.creator_id && <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Host</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {inGame ? (
        <LobbyChat lobbyId={lobby.id} currentUserId={user.id} people={people} />
      ) : (
        <p className="text-center text-sm text-muted-foreground">Join the game to chat with the group.</p>
      )}
    </div>
  )
}

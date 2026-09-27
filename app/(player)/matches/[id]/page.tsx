import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageHeader } from "@/components/common/PageHeader"
import { StatusBadge } from "@/components/common/StatusBadge"
import { SkillBadge } from "@/components/common/SkillBadge"
import { MatchChat } from "@/components/matches/MatchChat"
import { MatchActions } from "./MatchActions"
import { formatDate, initialsOf } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import { Calendar, MapPin } from "lucide-react"
import type { Metadata } from "next"

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "1v1" }

type Person = { id: string; full_name: string; avatar_url: string | null; skill_level: string }

function Side({ person, label, winner }: { person: Person | null; label: string; winner?: boolean }) {
  const body = (
    <>
      <Avatar className={cn("mx-auto size-16", winner && "ring-3 ring-primary ring-offset-2 ring-offset-card")}>
        <AvatarImage src={person?.avatar_url ?? undefined} alt="" />
        <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{initialsOf(person?.full_name)}</AvatarFallback>
      </Avatar>
      <p className="mt-2 truncate font-semibold">{person?.full_name ?? "Unknown"}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {person?.skill_level && <SkillBadge level={person.skill_level} className="mt-1" />}
    </>
  )
  return label === "You" || !person ? (
    <div className="min-w-0 flex-1 text-center">{body}</div>
  ) : (
    <Link href={`/players/${person.id}`} className="min-w-0 flex-1 text-center">{body}</Link>
  )
}

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
  const isParticipant = isPlayer || match.opponent_id === user.id
  const me = (isPlayer ? match.player : match.opponent) as unknown as Person | null
  const opponent = (isPlayer ? match.opponent : match.player) as unknown as Person | null
  const court = match.court as unknown as { name: string; city: string } | null
  const hasScore = match.player_sets != null && match.opponent_sets != null
  const mine = isPlayer ? match.player_sets : match.opponent_sets
  const theirs = isPlayer ? match.opponent_sets : match.player_sets
  const people = Object.fromEntries(
    [match.player, match.opponent]
      .map((p) => p as unknown as Person | null)
      .filter((p): p is Person => !!p)
      .map((p) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }]),
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader back={{ href: "/matches", label: "My 1v1s" }} />

      <section className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/[0.06]">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={match.status} />
          {match.scheduled_at ? (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="size-4" /> {formatDate(match.scheduled_at)}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Time to be agreed</span>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2">
          <Side person={me} label="You" winner={hasScore && mine! > theirs!} />
          <div className="shrink-0 px-2 text-center">
            {match.status === "completed" && hasScore ? (
              <p className="text-4xl font-bold tracking-tight tabular-nums">
                {mine}<span className="mx-1.5 text-muted-foreground/60">–</span>{theirs}
              </p>
            ) : (
              <p className="text-xl font-bold text-muted-foreground/60">VS</p>
            )}
          </div>
          <Side person={opponent} label="Opponent" winner={hasScore && theirs! > mine!} />
        </div>

        {(court || match.notes) && (
          <div className="mt-6 space-y-2 border-t border-border/70 pt-4 text-center text-sm">
            {court && (
              <p className="flex items-center justify-center gap-1.5 text-muted-foreground">
                <MapPin className="size-4" /> {court.name}, {court.city}
              </p>
            )}
            {match.notes && <p className="text-muted-foreground italic">&ldquo;{match.notes}&rdquo;</p>}
          </div>
        )}
      </section>

      <MatchActions
        match={{ id: match.id, status: match.status, player_id: match.player_id, opponent_id: match.opponent_id, scheduled_at: match.scheduled_at }}
        currentUserId={user.id}
        opponentName={opponent?.full_name?.split(" ")[0] ?? "your opponent"}
      />

      {isParticipant && ["confirmed", "pending", "completed"].includes(match.status) && (
        <MatchChat matchId={match.id} currentUserId={user.id} people={people} />
      )}
    </div>
  )
}

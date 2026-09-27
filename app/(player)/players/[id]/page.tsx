import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageHeader } from "@/components/common/PageHeader"
import { SkillBadge } from "@/components/common/SkillBadge"
import { formatDateShort, formatTimeAgo, initialsOf } from "@/lib/utils/format"
import { computeMatchFit } from "@/lib/utils/matchFit"
import { cn } from "@/lib/utils"
import { MapPin } from "lucide-react"
import { PlayerActions } from "./PlayerActions"
import type { Metadata } from "next"

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("profiles").select("full_name").eq("id", id).single()
  return { title: data?.full_name ?? "Player" }
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
      .order("scheduled_at", { ascending: false })
      .limit(10),
    supabase.from("player_favorites").select("player_id").eq("user_id", user.id).eq("player_id", id).maybeSingle(),
  ])

  if (!player) notFound()

  const isMe = player.id === user.id
  const matchFit = viewer && !isMe ? computeMatchFit(viewer, player) : null
  const games = (player.wins ?? 0) + (player.losses ?? 0)
  const winRate = games ? Math.round(((player.wins ?? 0) / games) * 100) : null

  // Score from the viewer's side: player_sets always belong to player_id.
  const h2h = (headToHead ?? [])
    .filter((m) => m.player_sets != null && m.opponent_sets != null)
    .map((m) => {
      const mine = m.player_id === user.id ? m.player_sets! : m.opponent_sets!
      const theirs = m.player_id === user.id ? m.opponent_sets! : m.player_sets!
      return { id: m.id, date: m.scheduled_at ?? m.created_at, mine, theirs, won: mine > theirs }
    })
  const h2hWins = h2h.filter((m) => m.won).length

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader back={{ href: "/players", label: "Players" }} className="-mb-4" />

      <section className="flex flex-col items-center text-center">
        <Avatar className="size-24 shadow-lift">
          <AvatarImage src={player.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="bg-primary/10 text-3xl font-bold text-primary">{initialsOf(player.full_name)}</AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-[28px] leading-tight font-bold">{player.full_name}</h1>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <SkillBadge level={player.skill_level} />
          <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{player.home_city}</span>
          {player.playing_style && <span>· {player.playing_style}</span>}
        </div>
        {player.last_active_at && <p className="mt-1 text-xs text-muted-foreground">Active {formatTimeAgo(player.last_active_at)}</p>}
        {player.bio && <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">{player.bio}</p>}
      </section>

      {!isMe && <PlayerActions currentUserId={user.id} player={player} isFav={!!favData} />}

      <section className="grid grid-cols-4 divide-x divide-border/70 rounded-3xl bg-card py-4 text-center shadow-soft ring-1 ring-foreground/[0.06]">
        {[
          { label: "Record", value: `${player.wins ?? 0}–${player.losses ?? 0}` },
          { label: "Win rate", value: winRate != null ? `${winRate}%` : "—" },
          { label: "Rating", value: Number(player.rating ?? 0).toFixed(1) },
          { label: "Reliable", value: `${Math.round(Number(player.reliability_score ?? 0))}%` },
        ].map(({ label, value }) => (
          <div key={label} className="px-1">
            <p className="text-xl font-bold tabular-nums">{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      {matchFit !== null && (
        <section className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/[0.06]">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Match fit</h2>
            <p className={cn("text-2xl font-bold tabular-nums", matchFit >= 70 ? "text-primary" : matchFit >= 50 ? "text-amber-600" : "text-muted-foreground")}>
              {matchFit}%
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${matchFit}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Based on rating, availability, reliability and location.</p>
        </section>
      )}

      {h2h.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Head to head</h2>
            <p className="text-sm text-muted-foreground">
              You {h2hWins}–{h2h.length - h2hWins}
            </p>
          </div>
          <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-foreground/[0.06]">
            {h2h.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="text-muted-foreground">{formatDateShort(m.date)}</span>
                <span className={cn("font-semibold", m.won ? "text-primary" : "text-muted-foreground")}>{m.won ? "Won" : "Lost"}</span>
                <span className="font-semibold tabular-nums">{m.mine}–{m.theirs}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

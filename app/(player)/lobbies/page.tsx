import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/common/EmptyState"
import { PageHeader } from "@/components/common/PageHeader"
import { PlaySwitch } from "@/components/common/PlaySwitch"
import { formatDate, initialsOf } from "@/lib/utils/format"
import { Users, MapPin, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Open games" }

export default async function LobbiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: lobbies } = await supabase
    .from("open_matches")
    .select(`*, creator:profiles!open_matches_creator_id_fkey(full_name, avatar_url), court:courts(name, city), joins:open_match_joins(id, user_id, user:profiles(full_name, avatar_url))`)
    .eq("status", "open")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Play"
        subtitle="Jump into a pickup game near you."
        action={
          <Link href="/lobbies/new" className={cn(buttonVariants({ size: "sm" }), "rounded-full")}>
            <Plus /> Host a game
          </Link>
        }
      />
      <PlaySwitch active="lobbies" />

      {!lobbies?.length ? (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title="No open games right now"
          description="Start one — players nearby can see it and join in a tap."
          action={<Link href="/lobbies/new" className={buttonVariants({ size: "lg" })}>Host a game</Link>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lobbies.map((lobby) => {
            type Join = { id: string; user_id: string; user: { full_name: string; avatar_url: string | null } | null }
            const joins = (lobby.joins as unknown as Join[]) ?? []
            const spotsLeft = Math.max(0, lobby.max_players - joins.length)
            const hasJoined = joins.some((j) => j.user_id === user.id)
            const court = lobby.court as unknown as { name: string; city: string } | null
            const creator = lobby.creator as unknown as { full_name: string } | null
            const filled = Math.min(100, (joins.length / lobby.max_players) * 100)

            return (
              <Link
                key={lobby.id}
                href={`/lobbies/${lobby.id}`}
                className="flex flex-col gap-3 rounded-3xl bg-card p-4 shadow-soft ring-1 ring-foreground/[0.06] transition-all hover:ring-foreground/15 active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary">{formatDate(lobby.scheduled_at)}</p>
                    <h2 className="truncate text-lg font-semibold">
                      {lobby.match_type} · {lobby.max_players} players
                    </h2>
                    {court && (
                      <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" /> {court.name}, {court.city}
                      </p>
                    )}
                  </div>
                  {hasJoined ? (
                    <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">You&apos;re in</span>
                  ) : (
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                        spotsLeft === 0 ? "bg-muted text-muted-foreground" : spotsLeft <= 2 ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-primary/10 text-primary",
                      )}
                    >
                      {spotsLeft === 0 ? "Full" : `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${filled}%` }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {joins.slice(0, 5).map((j) => (
                        <Avatar key={j.id} className="size-7 ring-2 ring-card">
                          <AvatarImage src={j.user?.avatar_url ?? undefined} alt="" />
                          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">{initialsOf(j.user?.full_name)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                      {joins.length}/{lobby.max_players} going · hosted by {creator?.full_name?.split(" ")[0]}
                    </span>
                  </div>
                </div>

                {lobby.notes && <p className="line-clamp-2 text-sm text-muted-foreground">{lobby.notes}</p>}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

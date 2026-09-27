"use client"

import { useMemo, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Heart, Search, SearchX, X } from "lucide-react"
import { toast } from "sonner"
import { PlayerCard } from "@/components/players/PlayerCard"
import { MatchRequestModal } from "@/components/players/MatchRequestModal"
import { EmptyState } from "@/components/common/EmptyState"
import { toggleFavorite } from "@/lib/api/favorites"
import { computeMatchFit } from "@/lib/utils/matchFit"
import { CITIES } from "@/lib/utils/pitch"
import type { Profile } from "@/types/database.types"
import { cn } from "@/lib/utils"

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"]
const SORTS = [
  { key: "fit", label: "Best match" },
  { key: "rating", label: "Top rated" },
  { key: "active", label: "Recently active" },
] as const

interface Props {
  currentUser: Profile
  players: Profile[]
  initialFavs: string[]
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all active:scale-95",
        active ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/30",
      )}
    >
      {children}
    </button>
  )
}

export function PlayersGrid({ currentUser, players, initialFavs }: Props) {
  const [search, setSearch] = useState("")
  const [city, setCity] = useState<string | null>(null)
  const [skill, setSkill] = useState<string | null>(null)
  const [favsOnly, setFavsOnly] = useState(false)
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("fit")
  const [requestTarget, setRequestTarget] = useState<Profile | null>(null)
  const [favs, setFavs] = useState<Set<string>>(() => new Set(initialFavs))

  const favMutation = useMutation({
    mutationFn: ({ playerId, isFav }: { playerId: string; isFav: boolean }) => toggleFavorite(currentUser.id, playerId, isFav),
    onMutate: ({ playerId, isFav }) => {
      setFavs((prev) => {
        const next = new Set(prev)
        if (isFav) next.delete(playerId)
        else next.add(playerId)
        return next
      })
    },
    onError: (_e, { playerId, isFav }) => {
      // Roll back the optimistic change.
      setFavs((prev) => {
        const next = new Set(prev)
        if (isFav) next.add(playerId)
        else next.delete(playerId)
        return next
      })
      toast.error("Couldn't update favourites")
    },
  })

  const withFit = useMemo(
    () => players.filter((p) => p.id !== currentUser.id).map((p) => ({ player: p, fit: computeMatchFit(currentUser, p) })),
    [players, currentUser],
  )

  const q = search.trim().toLowerCase()
  const results = withFit
    .filter(({ player: p }) => !city || p.home_city === city)
    .filter(({ player: p }) => !skill || p.skill_level === skill)
    .filter(({ player: p }) => !favsOnly || favs.has(p.id))
    .filter(({ player: p }) => !q || [p.full_name, p.home_city, p.playing_style].some((v) => v?.toLowerCase().includes(q)))
    .sort((a, b) =>
      sort === "fit"
        ? b.fit - a.fit
        : sort === "rating"
          ? Number(b.player.rating) - Number(a.player.rating)
          : (b.player.last_active_at ?? "").localeCompare(a.player.last_active_at ?? ""),
    )

  const anyFilter = city || skill || favsOnly || q

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, city or position"
          aria-label="Search players"
          className="h-12 w-full rounded-2xl border border-input bg-card pr-10 pl-10 text-base shadow-soft outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
        <Chip active={favsOnly} onClick={() => setFavsOnly((v) => !v)}>
          <Heart className={cn("size-4", favsOnly && "fill-current")} /> Favourites
        </Chip>
        <span className="mx-1 w-px shrink-0 self-stretch bg-border" aria-hidden />
        {CITIES.map((c) => (
          <Chip key={c} active={city === c} onClick={() => setCity(city === c ? null : c)}>{c}</Chip>
        ))}
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
        {SKILL_LEVELS.map((s) => (
          <Chip key={s} active={skill === s} onClick={() => setSkill(skill === s ? null : s)}>{s}</Chip>
        ))}
        {anyFilter && (
          <button
            type="button"
            onClick={() => { setCity(null); setSkill(null); setFavsOnly(false); setSearch("") }}
            className="shrink-0 px-2 text-sm font-medium text-primary"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {results.length} {results.length === 1 ? "player" : "players"}
        </p>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-8 rounded-lg border border-input bg-card px-2 text-sm font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-7" />}
          title={favsOnly && !favs.size ? "No favourites yet" : "No players match"}
          description={favsOnly && !favs.size ? "Tap the heart on a player to keep them here." : "Try another city or skill level."}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.map(({ player, fit }) => (
            <PlayerCard
              key={player.id}
              player={player}
              matchFit={fit}
              isFav={favs.has(player.id)}
              onToggleFav={() => favMutation.mutate({ playerId: player.id, isFav: favs.has(player.id) })}
              onSendRequest={() => setRequestTarget(player)}
            />
          ))}
        </div>
      )}

      {requestTarget && (
        <MatchRequestModal
          open={!!requestTarget}
          onClose={() => setRequestTarget(null)}
          currentUserId={currentUser.id}
          opponent={requestTarget}
        />
      )}
    </div>
  )
}

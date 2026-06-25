"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PlayerCard } from "@/components/players/PlayerCard"
import { MatchRequestModal } from "@/components/players/MatchRequestModal"
import { PlayerCardSkeleton } from "@/components/common/LoadingSkeleton"
import { EmptyState } from "@/components/common/EmptyState"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { fetchPlayers } from "@/lib/api/players"
import { toggleFavorite } from "@/lib/api/favorites"
import { computeMatchFit } from "@/lib/utils/matchFit"
import type { Profile } from "@/types/database.types"
import { Users, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"]
const CITIES = ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta"]

interface Props {
  currentUser: Profile
  initialPlayers: Profile[]
  initialFavs: string[]
}

export function PlayersGrid({ currentUser, initialPlayers, initialFavs }: Props) {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [city, setCity] = useState("")
  const [skill, setSkill] = useState("")
  const [requestTarget, setRequestTarget] = useState<Profile | null>(null)
  const [favs, setFavs] = useState<Set<string>>(new Set(initialFavs))

  const { data: players = initialPlayers, isLoading } = useQuery({
    queryKey: ["players", { city, skill }],
    queryFn: () => fetchPlayers({ city: city || undefined, skillLevel: skill ? [skill] : undefined }),
    initialData: initialPlayers,
  })

  const favMutation = useMutation({
    mutationFn: ({ playerId, isFav }: { playerId: string; isFav: boolean }) =>
      toggleFavorite(currentUser.id, playerId, isFav),
    onMutate: ({ playerId, isFav }) => {
      setFavs((prev) => {
        const next = new Set(prev)
        if (isFav) next.delete(playerId)
        else next.add(playerId)
        return next
      })
    },
    onError: () => toast.error("Failed to update favourite"),
  })

  const filtered = players.filter((p) => {
    if (!search) return true
    return (
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.home_city.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by name or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={city} onValueChange={(v: string | null) => setCity(v ?? "")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All cities</SelectItem>
            {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={skill} onValueChange={(v: string | null) => setSkill(v ?? "")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Any skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any skill</SelectItem>
            {SKILL_LEVELS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {(city || skill || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setCity(""); setSkill(""); setSearch("") }}>
            Clear filters
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} player{filtered.length !== 1 ? "s" : ""} found
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <PlayerCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title="No players found"
          description="Try adjusting your filters"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              matchFit={computeMatchFit(currentUser, player)}
              isFav={favs.has(player.id)}
              onToggleFav={() =>
                favMutation.mutate({ playerId: player.id, isFav: favs.has(player.id) })
              }
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

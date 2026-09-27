"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SkillBadge } from "@/components/common/SkillBadge"
import { initialsOf } from "@/lib/utils/format"
import type { Profile } from "@/types/database.types"
import { cn } from "@/lib/utils"

interface PlayerCardProps {
  player: Profile
  matchFit?: number
  isFav: boolean
  onToggleFav: () => void
  onSendRequest: () => void
}

export function fitTone(fit: number) {
  return fit >= 70 ? "text-primary bg-primary/10" : fit >= 50 ? "text-amber-700 bg-amber-500/12 dark:text-amber-300" : "text-muted-foreground bg-muted"
}

export function PlayerCard({ player, matchFit, isFav, onToggleFav, onSendRequest }: PlayerCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft ring-1 ring-foreground/[0.06]">
      <Link href={`/players/${player.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar className="size-12 shrink-0">
          <AvatarImage src={player.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">{initialsOf(player.full_name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{player.full_name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {player.home_city}
            {player.playing_style ? ` · ${player.playing_style}` : ""}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <SkillBadge level={player.skill_level} />
            <span className="whitespace-nowrap tabular-nums">
              {player.wins}W–{player.losses}L · ★ {Number(player.rating).toFixed(1)}
            </span>
          </div>
        </div>
      </Link>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex items-center gap-1">
          {matchFit !== undefined && (
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", fitTone(matchFit))} title="Match fit">
              {matchFit}%
            </span>
          )}
          <button
            type="button"
            onClick={onToggleFav}
            aria-pressed={isFav}
            aria-label={isFav ? `Remove ${player.full_name} from favourites` : `Add ${player.full_name} to favourites`}
            className="flex size-8 items-center justify-center rounded-full transition-transform hover:bg-muted active:scale-90"
          >
            <Heart className={cn("size-4.5", isFav ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
          </button>
        </div>
        <button
          type="button"
          onClick={onSendRequest}
          className="h-8 rounded-full bg-primary/10 px-3.5 text-sm font-semibold text-primary transition-all hover:bg-primary/15 active:scale-95"
        >
          Challenge
        </button>
      </div>
    </div>
  )
}

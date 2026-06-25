"use client"

import Link from "next/link"
import { Heart, Swords, Star, MapPin, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SkillBadge } from "@/components/common/SkillBadge"
import type { Profile } from "@/types/database.types"

interface PlayerCardProps {
  player: Profile
  matchFit?: number
  isFav: boolean
  onToggleFav: () => void
  onSendRequest: () => void
}

export function PlayerCard({ player, matchFit, isFav, onToggleFav, onSendRequest }: PlayerCardProps) {
  const initials = player.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between mb-3">
          <Link href={`/players/${player.id}`} className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={player.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold hover:text-primary transition-colors">{player.full_name}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3" />
                {player.home_city}
              </div>
            </div>
          </Link>
          <button
            onClick={onToggleFav}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label={isFav ? "Remove favourite" : "Add favourite"}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
            />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <SkillBadge level={player.skill_level} />
          {player.availability && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {player.availability}
            </span>
          )}
          {player.playing_style && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {player.playing_style}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            {Number(player.rating).toFixed(1)}
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-primary" />
            {Math.round(Number(player.reliability_score))}% reliable
          </div>
          <div className="ml-auto font-medium text-foreground">
            {player.wins}W / {player.losses}L
          </div>
        </div>

        {matchFit !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Match fit</span>
              <span className={`font-semibold ${matchFit >= 70 ? "text-primary" : matchFit >= 50 ? "text-amber-600" : "text-muted-foreground"}`}>
                {matchFit}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${matchFit >= 70 ? "bg-primary" : matchFit >= 50 ? "bg-amber-500" : "bg-slate-300"}`}
                style={{ width: `${matchFit}%` }}
              />
            </div>
          </div>
        )}

        <Button size="sm" className="w-full gap-2" onClick={onSendRequest}>
          <Swords className="h-3.5 w-3.5" /> Send Match Request
        </Button>
      </CardContent>
    </Card>
  )
}

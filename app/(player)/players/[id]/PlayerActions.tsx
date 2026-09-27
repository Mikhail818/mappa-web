"use client"

import { useState } from "react"
import { Heart, Swords } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { MatchRequestModal } from "@/components/players/MatchRequestModal"
import { toggleFavorite } from "@/lib/api/favorites"
import type { Profile } from "@/types/database.types"
import { cn } from "@/lib/utils"

interface Props {
  currentUserId: string
  player: Profile
  isFav: boolean
}

export function PlayerActions({ currentUserId, player, isFav: initialFav }: Props) {
  const [isFav, setIsFav] = useState(initialFav)
  const [showRequest, setShowRequest] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleFav() {
    setLoading(true)
    try {
      await toggleFavorite(currentUserId, player.id, isFav)
      setIsFav(!isFav)
    } catch {
      toast.error("Couldn't update favourites")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="lg" className="flex-1" onClick={() => setShowRequest(true)}>
        <Swords /> Challenge to a 1v1
      </Button>
      <Button
        size="icon-lg"
        variant="outline"
        onClick={handleFav}
        disabled={loading}
        aria-pressed={isFav}
        aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
      >
        <Heart className={cn("size-5", isFav && "fill-red-500 text-red-500")} />
      </Button>
      <MatchRequestModal open={showRequest} onClose={() => setShowRequest(false)} currentUserId={currentUserId} opponent={player} />
    </div>
  )
}

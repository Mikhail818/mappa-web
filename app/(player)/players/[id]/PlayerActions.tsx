"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Swords } from "lucide-react"
import { MatchRequestModal } from "@/components/players/MatchRequestModal"
import { toggleFavorite } from "@/lib/api/favorites"
import { toast } from "sonner"
import type { Profile } from "@/types/database.types"

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
      toast.success(isFav ? "Removed from favourites" : "Added to favourites")
    } catch {
      toast.error("Failed to update")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-3">
      <Button variant="outline" className="flex-1 gap-2" onClick={handleFav} disabled={loading}>
        <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
        {isFav ? "Unfavourite" : "Favourite"}
      </Button>
      <Button className="flex-1 gap-2" onClick={() => setShowRequest(true)}>
        <Swords className="h-4 w-4" /> Send Request
      </Button>
      <MatchRequestModal
        open={showRequest}
        onClose={() => setShowRequest(false)}
        currentUserId={currentUserId}
        opponent={player}
      />
    </div>
  )
}

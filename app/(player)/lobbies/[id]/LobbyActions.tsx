"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { joinOpenMatch, leaveOpenMatch } from "@/lib/api/lobbies"
import { toast } from "sonner"
import { UserPlus, UserMinus } from "lucide-react"

interface Props {
  lobbyId: string
  currentUserId: string
  hasJoined: boolean
  isCreator: boolean
  isFull: boolean
  currentSlot: number
}

export function LobbyActions({ lobbyId, currentUserId, hasJoined, isCreator, isFull, currentSlot }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function join() {
    setLoading(true)
    try {
      await joinOpenMatch(lobbyId, currentUserId, currentSlot)
      toast.success("You've joined the lobby!")
      router.refresh()
    } catch { toast.error("Failed to join") }
    finally { setLoading(false) }
  }

  async function leave() {
    setLoading(true)
    try {
      await leaveOpenMatch(lobbyId, currentUserId)
      toast.success("Left the lobby")
      router.refresh()
    } catch { toast.error("Failed to leave") }
    finally { setLoading(false) }
  }

  if (isCreator) return null

  return (
    <div>
      {hasJoined ? (
        <Button variant="outline" onClick={leave} disabled={loading} className="gap-2 text-destructive border-destructive hover:bg-destructive/10">
          <UserMinus className="h-4 w-4" /> Leave Lobby
        </Button>
      ) : (
        <Button onClick={join} disabled={loading || isFull} className="gap-2">
          <UserPlus className="h-4 w-4" />
          {isFull ? "Lobby Full" : "Join Lobby"}
        </Button>
      )}
    </div>
  )
}

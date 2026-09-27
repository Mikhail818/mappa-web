"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { joinOpenMatch, leaveOpenMatch } from "@/lib/api/lobbies"

interface Props {
  lobbyId: string
  currentUserId: string
  hasJoined: boolean
  isCreator: boolean
  isFull: boolean
  nextSlot: number
}

export function LobbyActions({ lobbyId, currentUserId, hasJoined, isCreator, isFull, nextSlot }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function run(action: () => Promise<unknown>, success: string) {
    setLoading(true)
    try {
      await action()
      toast.success(success)
      router.refresh()
    } catch {
      toast.error(hasJoined ? "Couldn't leave the game" : "Couldn't join — the last spot may have just gone")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (isCreator) {
    return <p className="text-center text-sm text-muted-foreground">You&apos;re hosting — share the game so it fills up.</p>
  }

  return hasJoined ? (
    <Button
      size="lg"
      variant="ghost"
      className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={loading}
      onClick={() => run(() => leaveOpenMatch(lobbyId, currentUserId), "You've left the game")}
    >
      Leave game
    </Button>
  ) : (
    <Button
      size="lg"
      className="w-full"
      disabled={loading || isFull}
      onClick={() => run(() => joinOpenMatch(lobbyId, currentUserId, nextSlot), "You're in! See you on the pitch")}
    >
      {loading ? <Loader2 className="animate-spin" /> : <UserPlus />}
      {isFull ? "Game is full" : "Join game"}
    </Button>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, Clock, Loader2, Minus, Plus, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { acceptMatchRequest, cancelMatch, disputeScore, submitScore } from "@/lib/api/matches"

interface Props {
  match: { id: string; status: string; player_id: string; opponent_id: string; scheduled_at: string | null }
  currentUserId: string
  opponentName: string
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-5xl font-bold tabular-nums" aria-live="polite">{value}</p>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`${label}: fewer`} disabled={value <= 0} onClick={() => onChange(value - 1)} className="flex size-10 items-center justify-center rounded-full bg-muted transition-transform active:scale-90 disabled:opacity-40">
          <Minus className="size-4" />
        </button>
        <button type="button" aria-label={`${label}: more`} disabled={value >= 20} onClick={() => onChange(value + 1)} className="flex size-10 items-center justify-center rounded-full bg-muted transition-transform active:scale-90 disabled:opacity-40">
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function MatchActions({ match, currentUserId, opponentName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [scoreOpen, setScoreOpen] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [mine, setMine] = useState(0)
  const [theirs, setTheirs] = useState(0)
  // Results only make sense once the game has kicked off.
  const [now] = useState(() => Date.now())
  const isPlayer = match.player_id === currentUserId
  const isOpponent = match.opponent_id === currentUserId
  if (!isPlayer && !isOpponent) return null

  const disputing = match.status === "completed"
  const kickedOff = !match.scheduled_at || new Date(match.scheduled_at).getTime() <= now

  async function run(action: () => Promise<unknown>, success: string, after?: () => void) {
    setLoading(true)
    try {
      await action()
      toast.success(success)
      after?.()
      router.refresh()
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  function saveScore() {
    if (mine === theirs) {
      toast("Scores can't be level — someone has to win")
      return
    }
    const playerSets = isPlayer ? mine : theirs
    const opponentSets = isPlayer ? theirs : mine
    run(
      () => (disputing ? disputeScore : submitScore)(match.id, currentUserId, playerSets, opponentSets),
      disputing ? "Dispute sent — we'll review it" : mine > theirs ? "Nice win! Score saved" : "Score saved",
      () => setScoreOpen(false),
    )
  }

  const cancelLabel = match.status === "pending" ? (isOpponent ? "Decline" : "Withdraw challenge") : "Cancel match"

  return (
    <div className="space-y-3">
      {match.status === "pending" && isPlayer && (
        <p className="flex items-center gap-2 rounded-2xl bg-amber-500/12 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          <Clock className="size-4 shrink-0" /> Waiting for {opponentName} to reply.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {match.status === "pending" && isOpponent && (
          <Button size="lg" className="flex-1" disabled={loading} onClick={() => run(() => acceptMatchRequest(match.id), "Challenge accepted — game on!")}>
            <Check /> Accept challenge
          </Button>
        )}
        {match.status === "confirmed" && kickedOff && (
          <Button size="lg" className="flex-1" onClick={() => setScoreOpen(true)}>
            <Trophy /> Enter result
          </Button>
        )}
        {["pending", "confirmed"].includes(match.status) && (
          <Button
            size="lg"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none"
            disabled={loading}
            onClick={() => setConfirmCancel(true)}
          >
            {cancelLabel}
          </Button>
        )}
      </div>

      {disputing && (
        <button type="button" onClick={() => setScoreOpen(true)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
          Score not right? <span className="font-medium text-primary">Report it</span>
        </button>
      )}

      <Dialog open={scoreOpen} onOpenChange={setScoreOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{disputing ? "Report the correct score" : "How did it go?"}</DialogTitle>
            <DialogDescription>Enter the number of sets each of you won.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-2">
            <Stepper label="You" value={mine} onChange={setMine} />
            <span className="pt-6 text-2xl font-bold text-muted-foreground/50">–</span>
            <Stepper label={opponentName} value={theirs} onChange={setTheirs} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScoreOpen(false)}>Cancel</Button>
            <Button onClick={saveScore} disabled={loading} variant={disputing ? "destructive" : "default"}>
              {loading && <Loader2 className="animate-spin" />}
              {disputing ? "Send dispute" : "Save result"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{cancelLabel}?</DialogTitle>
            <DialogDescription>
              {opponentName} will see that the match is off.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(false)}>Keep it</Button>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={() => run(() => cancelMatch(match.id), match.status === "pending" && isOpponent ? "Challenge declined" : "Match cancelled", () => { setConfirmCancel(false); router.push("/matches") })}
            >
              {cancelLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

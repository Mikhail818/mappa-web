"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { acceptMatchRequest, submitScore, cancelMatch, disputeScore } from "@/lib/api/matches"
import { toast } from "sonner"
import { Check, X, Trophy, AlertTriangle } from "lucide-react"

interface Props {
  match: { id: string; status: string; player_id: string; opponent_id: string }
  currentUserId: string
}

export function MatchActions({ match, currentUserId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [scoreModal, setScoreModal] = useState(false)
  const [myScore, setMyScore] = useState("")
  const [oppScore, setOppScore] = useState("")
  const isPlayer = match.player_id === currentUserId
  const isOpponent = match.opponent_id === currentUserId
  const canAct = isPlayer || isOpponent

  if (!canAct) return null

  async function accept() {
    setLoading(true)
    try {
      await acceptMatchRequest(match.id)
      toast.success("Match confirmed!")
      router.refresh()
    } catch { toast.error("Failed to confirm match") }
    finally { setLoading(false) }
  }

  async function cancel() {
    setLoading(true)
    try {
      await cancelMatch(match.id)
      toast.success("Match cancelled")
      router.push("/matches")
    } catch { toast.error("Failed to cancel match") }
    finally { setLoading(false) }
  }

  async function submitScoreHandler() {
    const my = parseInt(myScore)
    const opp = parseInt(oppScore)
    if (isNaN(my) || isNaN(opp)) { toast.error("Enter valid scores"); return }
    setLoading(true)
    const playerSets = isPlayer ? my : opp
    const opponentSets = isPlayer ? opp : my
    try {
      await submitScore(match.id, currentUserId, playerSets, opponentSets)
      toast.success("Score submitted!")
      setScoreModal(false)
      router.refresh()
    } catch { toast.error("Failed to submit score") }
    finally { setLoading(false) }
  }

  async function dispute() {
    const my = parseInt(myScore)
    const opp = parseInt(oppScore)
    if (isNaN(my) || isNaN(opp)) { toast.error("Enter your claimed scores"); return }
    setLoading(true)
    const playerSets = isPlayer ? my : opp
    const opponentSets = isPlayer ? opp : my
    try {
      await disputeScore(match.id, currentUserId, playerSets, opponentSets)
      toast.success("Dispute raised")
      setScoreModal(false)
      router.refresh()
    } catch { toast.error("Failed to raise dispute") }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {match.status === "pending" && isOpponent && (
        <Button onClick={accept} disabled={loading} className="gap-2">
          <Check className="h-4 w-4" /> Accept Challenge
        </Button>
      )}
      {["pending", "confirmed"].includes(match.status) && (
        <Button variant="outline" onClick={cancel} disabled={loading} className="gap-2 text-destructive border-destructive hover:bg-destructive/10">
          <X className="h-4 w-4" /> Cancel
        </Button>
      )}
      {match.status === "confirmed" && (
        <Button variant="outline" onClick={() => setScoreModal(true)} className="gap-2">
          <Trophy className="h-4 w-4" /> Submit Score
        </Button>
      )}
      {match.status === "completed" && (
        <Button variant="ghost" size="sm" onClick={() => setScoreModal(true)} className="gap-2 text-orange-600">
          <AlertTriangle className="h-4 w-4" /> Dispute Score
        </Button>
      )}

      <Dialog open={scoreModal} onOpenChange={setScoreModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {match.status === "completed" ? "Dispute Score" : "Submit Score"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter the number of sets</p>
            <div className="flex items-center gap-3">
              <div className="space-y-1 flex-1">
                <Label>My sets</Label>
                <Input
                  type="number" min="0" max="10"
                  value={myScore} onChange={(e) => setMyScore(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="text-xl font-bold text-muted-foreground pt-5">–</div>
              <div className="space-y-1 flex-1">
                <Label>Opponent sets</Label>
                <Input
                  type="number" min="0" max="10"
                  value={oppScore} onChange={(e) => setOppScore(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setScoreModal(false)}>Cancel</Button>
            {match.status === "completed" ? (
              <Button variant="destructive" onClick={dispute} disabled={loading}>Dispute</Button>
            ) : (
              <Button onClick={submitScoreHandler} disabled={loading}>Submit Score</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

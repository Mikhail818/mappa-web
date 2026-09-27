"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { WhenPicker } from "@/components/common/WhenPicker"
import { createMatchRequest } from "@/lib/api/matches"
import type { Profile } from "@/types/database.types"

interface Props {
  open: boolean
  onClose: () => void
  currentUserId: string
  opponent: Profile
}

export function MatchRequestModal({ open, onClose, currentUserId, opponent }: Props) {
  const [when, setWhen] = useState<Date | null>(null)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const firstName = opponent.full_name.split(" ")[0]

  async function send() {
    setLoading(true)
    try {
      await createMatchRequest(currentUserId, opponent.id, {
        // A real instant, so it's stored correctly whatever the database's time zone.
        scheduledAt: when?.toISOString(),
        notes: notes.trim() || undefined,
      })
      toast.success(`Challenge sent to ${firstName}`, { description: "You'll see it in Play once they reply." })
      setWhen(null)
      setNotes("")
      onClose()
    } catch {
      toast.error("Couldn't send your challenge. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Challenge {firstName}</DialogTitle>
          <DialogDescription>
            1v1 against {opponent.full_name} · {opponent.skill_level} · {opponent.home_city}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <WhenPicker value={when} onChange={setWhen} optional label="Suggest a time" />
          <div className="space-y-1.5">
            <Label htmlFor="challenge-notes">
              Message <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="challenge-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
              placeholder={`Hey ${firstName}, up for a game at the Arena?`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={send} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Send challenge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

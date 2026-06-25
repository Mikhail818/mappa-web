"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createMatchRequest } from "@/lib/api/matches"
import { toast } from "sonner"
import type { Profile } from "@/types/database.types"

const schema = z.object({
  scheduledAt: z.string().optional(),
  notes: z.string().max(200).optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  currentUserId: string
  opponent: Profile
}

export function MatchRequestModal({ open, onClose, currentUserId, opponent }: Props) {
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      await createMatchRequest(currentUserId, opponent.id, {
        scheduledAt: values.scheduledAt || undefined,
        notes: values.notes,
      })
      toast.success(`Match request sent to ${opponent.full_name}!`)
      reset()
      onClose()
    } catch {
      toast.error("Failed to send request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Match Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Challenging <strong>{opponent.full_name}</strong> ({opponent.skill_level}) to a match.
          </p>
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Proposed date & time (optional)</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              {...register("scheduledAt")}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Message (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g. I'm free evenings in Limassol, any court works"
              rows={3}
              {...register("notes")}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

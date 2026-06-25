"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createOpenMatch } from "@/lib/api/lobbies"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const schema = z.object({
  matchType: z.string().min(1),
  maxPlayers: z.number().min(2).max(22),
  scheduledAt: z.string().min(1, "Select a date and time"),
  notes: z.string().max(300).optional(),
})
type FormValues = z.infer<typeof schema>

export default function NewLobbyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { matchType: "doubles", maxPlayers: 10 },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error("Not logged in"); setLoading(false); return }
    try {
      const lobby = await createOpenMatch({
        creatorId: user.id,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        matchType: values.matchType,
        maxPlayers: values.maxPlayers,
        notes: values.notes,
      })
      toast.success("Lobby created!")
      router.push(`/lobbies/${lobby.id}`)
    } catch {
      toast.error("Failed to create lobby")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/lobbies" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">Create Lobby</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Match type</Label>
                <Select onValueChange={(v: string | null) => setValue("matchType", v ?? "")} defaultValue="doubles">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="singles">Singles (1v1)</SelectItem>
                    <SelectItem value="doubles">Doubles (2v2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Max players</Label>
                <Input type="number" min={2} max={22} {...register("maxPlayers", { valueAsNumber: true })} />
                {errors.maxPlayers && <p className="text-xs text-destructive">{errors.maxPlayers.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date & time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                {...register("scheduledAt")}
                min={new Date().toISOString().slice(0, 16)}
              />
              {errors.scheduledAt && <p className="text-xs text-destructive">{errors.scheduledAt.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" placeholder="e.g. Bring your boots, all levels welcome" rows={3} {...register("notes")} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating…" : "Create Lobby"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

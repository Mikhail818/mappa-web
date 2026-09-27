"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/common/PageHeader"
import { WhenPicker } from "@/components/common/WhenPicker"
import { createOpenMatch } from "@/lib/api/lobbies"
import { createClient } from "@/lib/supabase/client"
import { playersForFormat } from "@/lib/booking/slots"
import { FORMATS } from "@/lib/utils/pitch"
import { cn } from "@/lib/utils"

type Court = { id: string; name: string; city: string }

export default function NewLobbyPage() {
  const router = useRouter()
  const [format, setFormat] = useState("5v5")
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [when, setWhen] = useState<Date | null>(null)
  const [courtId, setCourtId] = useState<string>("")
  const [courts, setCourts] = useState<Court[]>([])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    createClient()
      .from("courts")
      .select("id, name, city")
      .order("city")
      .then(({ data }) => setCourts(data ?? []))
  }, [])

  function pickFormat(f: string) {
    setFormat(f)
    setMaxPlayers(playersForFormat(f))
  }

  async function create() {
    if (!when) {
      toast("Pick a day and kick-off time")
      return
    }
    setLoading(true)
    const { data: { user } } = await createClient().auth.getUser()
    if (!user) {
      toast.error("Your session expired — sign in again")
      router.push("/login?redirectTo=/lobbies/new")
      return
    }
    try {
      const lobby = await createOpenMatch({
        creatorId: user.id,
        scheduledAt: when.toISOString(),
        matchType: format,
        maxPlayers,
        courtId: courtId || undefined,
        notes: notes.trim() || undefined,
      })
      toast.success("Your game is live", { description: "Nearby players can now join." })
      router.push(`/lobbies/${lobby.id}`)
    } catch {
      toast.error("Couldn't create the game. Try again.")
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader back={{ href: "/lobbies", label: "Open games" }} title="Host a game" subtitle="Players nearby can see it and join in one tap." />

      <section className="space-y-5 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/[0.06]">
        <div className="space-y-2">
          <p className="text-sm font-medium">Format</p>
          <div className="flex flex-wrap gap-2">
            {FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={format === f}
                onClick={() => pickFormat(f)}
                className={cn(
                  "h-10 rounded-full border px-4 text-sm font-semibold transition-all active:scale-95",
                  format === f ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/30",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Players needed</p>
            <p className="text-xs text-muted-foreground">Including you</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-muted p-1">
            <button type="button" aria-label="Fewer players" disabled={maxPlayers <= 2} onClick={() => setMaxPlayers((n) => Math.max(2, n - 1))} className="flex size-9 items-center justify-center rounded-full bg-card shadow-soft transition-transform active:scale-90 disabled:opacity-40">
              <Minus className="size-4" />
            </button>
            <span className="w-9 text-center font-semibold tabular-nums" aria-live="polite">{maxPlayers}</span>
            <button type="button" aria-label="More players" disabled={maxPlayers >= 30} onClick={() => setMaxPlayers((n) => Math.min(30, n + 1))} className="flex size-9 items-center justify-center rounded-full bg-card shadow-soft transition-transform active:scale-90 disabled:opacity-40">
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/[0.06]">
        <WhenPicker value={when} onChange={setWhen} label="Kick-off" />
      </section>

      <section className="space-y-4 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/[0.06]">
        <div className="space-y-1.5">
          <Label htmlFor="court">Where</Label>
          <select
            id="court"
            value={courtId}
            onChange={(e) => setCourtId(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 md:text-sm"
          >
            <option value="">Decide later / in the chat</option>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.city}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">
            Notes <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} placeholder="All levels welcome, bring light and dark shirts…" />
        </div>
      </section>

      <Button size="lg" className="w-full" onClick={create} disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        Create game
      </Button>
    </div>
  )
}

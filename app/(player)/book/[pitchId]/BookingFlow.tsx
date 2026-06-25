"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { requestBooking } from "@/lib/api/bookings"
import { formatCurrency } from "@/lib/utils/format"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Check, Calendar, Users, User, CreditCard } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const FORMATS = ["5v5", "6v6", "7v7", "8v8", "9v9", "11v11"]
const STEPS = ["Date & Time", "Format", "Contact", "Summary"]

interface Pitch {
  id: string
  name: string
  price_per_hour_cents: number | null
  min_booking_minutes: number
  slot_granularity_minutes: number
  venue: { name: string; city: string } | null
}

interface Props {
  pitch: Pitch
  userId: string
  profile: { full_name: string; email: string | null } | null
}

export function BookingFlow({ pitch, userId, profile }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [format, setFormat] = useState("5v5")
  const [playerCount, setPlayerCount] = useState(10)
  const [contactName, setContactName] = useState(profile?.full_name ?? "")
  const [contactPhone, setContactPhone] = useState("")
  const [notes, setNotes] = useState("")

  const durationMins = startsAt && endsAt
    ? Math.max(0, (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000)
    : 0
  const totalCents = pitch.price_per_hour_cents
    ? Math.round((durationMins / 60) * pitch.price_per_hour_cents)
    : 0

  function next() { setStep((s) => Math.min(s + 1, 3)) }
  function back() { setStep((s) => Math.max(s - 1, 0)) }

  async function submit() {
    if (!startsAt || !endsAt) { toast.error("Select date/time"); return }
    setLoading(true)
    try {
      const booking = await requestBooking({
        pitchId: pitch.id,
        requesterId: userId,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        format,
        playerCount,
        totalPriceCents: totalCents || undefined,
        contactName,
        contactPhone,
        notes,
      })
      toast.success("Booking requested! The venue will confirm shortly.")
      router.push(`/bookings/${booking.id}`)
    } catch { toast.error("Failed to submit booking") }
    finally { setLoading(false) }
  }

  const minStart = new Date()
  minStart.setMinutes(0, 0, 0)
  const minStartStr = minStart.toISOString().slice(0, 16)

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/pitches/${pitch.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Book {pitch.name}</h1>
          <p className="text-sm text-muted-foreground">{pitch.venue?.name} · {pitch.venue?.city}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-1 flex-1">
            <div className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground ring-2 ring-primary/30" : "bg-muted text-muted-foreground",
            )}>
              {i < step ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span className={cn("text-xs hidden sm:block truncate", i === step ? "text-foreground font-medium" : "text-muted-foreground")}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className={cn("flex-1 h-px", i < step ? "bg-primary" : "bg-muted")} />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          {step === 0 && (
            <>
              <h2 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Select Date & Time</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start time</Label>
                  <Input
                    type="datetime-local"
                    value={startsAt}
                    min={minStartStr}
                    onChange={(e) => {
                      setStartsAt(e.target.value)
                      if (!endsAt) {
                        const end = new Date(e.target.value)
                        end.setMinutes(end.getMinutes() + pitch.min_booking_minutes)
                        setEndsAt(end.toISOString().slice(0, 16))
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End time</Label>
                  <Input type="datetime-local" value={endsAt} min={startsAt} onChange={(e) => setEndsAt(e.target.value)} />
                </div>
              </div>
              {durationMins > 0 && (
                <p className="text-sm text-muted-foreground">Duration: {durationMins >= 60 ? `${durationMins / 60}h` : `${durationMins}min`}</p>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Format & Players</h2>
              <div className="space-y-2">
                <Label>Match format</Label>
                <div className="grid grid-cols-3 gap-2">
                  {FORMATS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className={cn(
                        "border rounded-lg py-2 text-sm font-medium transition-colors",
                        format === f ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/40",
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Player count (approx.)</Label>
                <Input type="number" min={1} max={30} value={playerCount} onChange={(e) => setPlayerCount(+e.target.value)} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-semibold flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Contact Info</h2>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+357 99 000000" type="tel" />
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests?" />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Pitch</span><span>{pitch.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Start</span><span>{startsAt}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">End</span><span>{endsAt}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Format</span><span>{format}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Players</span><span>{playerCount}</span></div>
                {contactName && <div className="flex justify-between"><span className="text-muted-foreground">Contact</span><span>{contactName}</span></div>}
                {contactPhone && <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{contactPhone}</span></div>}
                <div className="border-t pt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">{totalCents ? formatCurrency(totalCents) : "Free"}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Payment is collected at the venue. The venue will confirm your booking request.
                </p>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button variant="outline" onClick={back} className="flex-1 gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={next}
                disabled={step === 0 && (!startsAt || !endsAt || durationMins < pitch.min_booking_minutes)}
                className="flex-1 gap-2"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={loading} className="flex-1">
                {loading ? "Submitting…" : "Submit Booking Request"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

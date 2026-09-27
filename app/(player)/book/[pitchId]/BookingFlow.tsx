"use client"

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CalendarX2, Loader2, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/common/PageHeader"
import { StickyActionBar } from "@/components/common/StickyActionBar"
import { PitchArt } from "@/components/pitches/PitchArt"
import { createClient } from "@/lib/supabase/client"
import { requestBooking } from "@/lib/api/bookings"
import { fetchBusyRanges } from "@/lib/booking/busy"
import {
  BOOKING_WINDOW_DAYS,
  buildSlots,
  durationOptions,
  formatDurationMinutes,
  isOpenOn,
  playersForFormat,
  priceFor,
  type AvailabilityWindow,
  type Slot,
} from "@/lib/booking/slots"
import { formatCurrency } from "@/lib/utils/format"
import { FORMATS } from "@/lib/utils/pitch"
import {
  addDays,
  dayOfWeek,
  formatClock,
  formatFullDate,
  formatTime,
  parseClock,
  toDateKey,
  zonedTime,
  type DateKey,
} from "@/lib/utils/time"
import { cn } from "@/lib/utils"

const PHONE_KEY = "mappa:contact-phone"
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface Pitch {
  id: string
  name: string
  format: string
  surface: string
  indoor: boolean
  capacity_players: number
  price_per_hour_cents: number | null
  min_booking_minutes: number
  slot_granularity_minutes: number
  venue: { name: string; city: string } | null
}

interface Props {
  pitch: Pitch
  availability: AvailabilityWindow[]
  userId: string
  defaultName: string
  nowIso: string
  initialDate?: DateKey
  initialTime?: string
}

const PERIODS = [
  { label: "Morning", from: 0, to: 12 * 60 },
  { label: "Afternoon", from: 12 * 60, to: 17 * 60 },
  { label: "Evening", from: 17 * 60, to: 48 * 60 },
]

const noopSubscribe = () => () => {}

function readSavedPhone() {
  try {
    return localStorage.getItem(PHONE_KEY) ?? ""
  } catch {
    return ""
  }
}

function isConflict(error: unknown) {
  const e = error as { code?: string; message?: string } | null
  return e?.code === "23P01" || /overlap|exclusion|conflict|already booked/i.test(e?.message ?? "")
}

export function BookingFlow({ pitch, availability, userId, defaultName, nowIso, initialDate, initialTime }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [now, setNow] = useState(() => new Date(nowIso))
  const today = toDateKey(now)

  const days = useMemo(
    () => Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => addDays(toDateKey(new Date(nowIso)), i)),
    [nowIso],
  )
  const firstOpen = days.find((d) => isOpenOn(d, availability)) ?? days[0]

  const durations = durationOptions(pitch.min_booking_minutes)
  const [date, setDate] = useState<DateKey>(initialDate ?? firstOpen)
  const [duration, setDuration] = useState(durations[0])
  const [startMinutes, setStartMinutes] = useState<number | null>(initialTime ? parseClock(initialTime) : null)

  const formats = FORMATS.filter((f) => !pitch.capacity_players || playersForFormat(f) <= pitch.capacity_players)
  const [format, setFormat] = useState(formats.includes(pitch.format) ? pitch.format : (formats[0] ?? pitch.format))
  const maxPlayers = Math.max(2, pitch.capacity_players || 30)
  const [players, setPlayers] = useState(Math.min(playersForFormat(format), maxPlayers))

  const [name, setName] = useState(defaultName)
  // null = untouched, so the phone remembered on this device shows through.
  const [phoneInput, setPhone] = useState<string | null>(null)
  const savedPhone = useSyncExternalStore(noopSubscribe, readSavedPhone, () => "")
  const phone = phoneInput ?? savedPhone
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  // Keep "now" fresh so slots that pass while the page is open disappear.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    stripRef.current
      ?.querySelector<HTMLElement>(`[data-date="${date}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }, [date])

  const busyQuery = useQuery({
    queryKey: ["pitch-busy", pitch.id, date],
    // Two days covers windows that run past midnight.
    queryFn: () => fetchBusyRanges(createClient(), pitch.id, zonedTime(date, 0), zonedTime(addDays(date, 2), 0)),
    staleTime: 30_000,
  })

  const slots = useMemo(
    () =>
      buildSlots({
        date,
        availability,
        busy: busyQuery.data ?? [],
        durationMinutes: duration,
        stepMinutes: pitch.slot_granularity_minutes,
        now,
      }),
    [date, availability, busyQuery.data, duration, pitch.slot_granularity_minutes, now],
  )

  const selected: Slot | undefined = slots.find((s) => s.startMinutes === startMinutes && s.available)
  const total = priceFor(pitch.price_per_hour_cents, duration)
  const openToday = isOpenOn(date, availability)
  const nextOpenDay = days.find((d) => d > date && isOpenOn(d, availability))

  // A chosen time can stop fitting: someone else booked it, or a longer duration now overlaps.
  const lostSelection = startMinutes != null && busyQuery.isSuccess && !selected

  function pickDate(d: DateKey) {
    setDate(d)
    setStartMinutes(null)
  }

  function pickFormat(f: string) {
    setFormat(f)
    setPlayers(Math.min(playersForFormat(f), maxPlayers))
  }

  async function submit() {
    if (!selected) {
      toast("Pick a time first")
      document.getElementById("times")?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    if (!name.trim()) {
      nameRef.current?.focus()
      toast("Add a name the venue can use for this booking")
      return
    }
    setSubmitting(true)
    try {
      const booking = await requestBooking({
        pitchId: pitch.id,
        requesterId: userId,
        startsAt: selected.start.toISOString(),
        endsAt: selected.end.toISOString(),
        format,
        playerCount: players,
        totalPriceCents: total || undefined,
        contactName: name.trim(),
        contactPhone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      try {
        if (phone.trim()) localStorage.setItem(PHONE_KEY, phone.trim())
      } catch {}
      router.push(`/bookings/${booking.id}?new=1`)
    } catch (error) {
      if (isConflict(error)) {
        toast.error("Someone just booked that time", { description: "We've refreshed the times — pick another." })
        setStartMinutes(null)
        queryClient.invalidateQueries({ queryKey: ["pitch-busy", pitch.id, date] })
      } else {
        toast.error("Couldn't send your request", { description: "Check your connection and try again." })
      }
      setSubmitting(false)
    }
  }

  const whenLabel = selected
    ? `${formatFullDate(selected.start)} · ${formatTime(selected.start)}–${formatTime(selected.end)}`
    : null

  const ctaLabel = submitting ? "Sending…" : "Request booking"

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        back={{ href: `/pitches/${pitch.id}`, label: pitch.venue?.name ?? "Back" }}
        title="Choose a time"
        subtitle={`${pitch.name} · ${pitch.venue?.city ?? ""}`}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0 space-y-8">
          {/* Date */}
          <section aria-labelledby="date-heading" className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 id="date-heading" className="text-lg font-semibold">Date</h2>
              <p className="text-sm text-muted-foreground">{formatFullDate(zonedTime(date, 12 * 60))}</p>
            </div>
            <div
              ref={stripRef}
              role="radiogroup"
              aria-labelledby="date-heading"
              className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pt-1 pb-2 scrollbar-none"
            >
              {days.map((d) => {
                const open = isOpenOn(d, availability)
                const active = d === date
                return (
                  <button
                    key={d}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    data-date={d}
                    disabled={!open}
                    onClick={() => pickDate(d)}
                    className={cn(
                      "flex w-[58px] shrink-0 snap-start flex-col items-center gap-0.5 rounded-2xl py-2.5 transition-all active:scale-95",
                      active
                        ? "bg-foreground text-background shadow-lift"
                        : "bg-card shadow-soft ring-1 ring-foreground/[0.06] hover:ring-foreground/20",
                      !open && "opacity-40 shadow-none",
                    )}
                  >
                    <span className={cn("text-[11px] font-medium uppercase", !active && "text-muted-foreground")}>
                      {d === today ? "Today" : WEEKDAY_SHORT[dayOfWeek(d)]}
                    </span>
                    <span className="text-xl font-semibold tabular-nums">{+d.slice(8)}</span>
                    <span className={cn("size-1 rounded-full", open ? (active ? "bg-background" : "bg-primary") : "bg-transparent")} />
                  </button>
                )
              })}
            </div>
          </section>

          {/* Duration */}
          <section aria-labelledby="duration-heading" className="space-y-3">
            <h2 id="duration-heading" className="text-lg font-semibold">Duration</h2>
            <div role="radiogroup" aria-labelledby="duration-heading" className="inline-grid w-full auto-cols-fr grid-flow-col gap-1 rounded-2xl bg-muted p-1 sm:w-auto">
              {durations.map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={d === duration}
                  onClick={() => setDuration(d)}
                  className={cn(
                    "rounded-xl px-5 py-2 text-sm font-semibold transition-all",
                    d === duration ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {formatDurationMinutes(d)}
                  {pitch.price_per_hour_cents ? (
                    <span className="block text-[11px] font-medium text-muted-foreground">
                      {formatCurrency(priceFor(pitch.price_per_hour_cents, d))}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          {/* Times */}
          <section id="times" aria-labelledby="times-heading" className="scroll-mt-24 space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 id="times-heading" className="text-lg font-semibold">Start time</h2>
              {busyQuery.isFetching && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Updating" />}
            </div>

            {lostSelection && (
              <p role="status" className="rounded-2xl bg-amber-500/12 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                {formatClock(startMinutes)} isn&apos;t free for {formatDurationMinutes(duration)} — pick another time.
              </p>
            )}

            {busyQuery.isPending ? (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : slots.length === 0 || !slots.some((s) => s.available) ? (
              <div className="flex flex-col items-center rounded-3xl border border-dashed bg-card/50 px-6 py-10 text-center">
                <CalendarX2 className="mb-3 size-8 text-muted-foreground" />
                <p className="font-semibold">
                  {!openToday ? "Closed on this day" : date === today && slots.length === 0 ? "No more times today" : "Fully booked"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {nextOpenDay ? "Try another day — here's the next one that's open." : "Try a shorter duration or check back soon."}
                </p>
                {nextOpenDay && (
                  <Button variant="secondary" className="mt-4" onClick={() => pickDate(nextOpenDay)}>
                    {formatFullDate(zonedTime(nextOpenDay, 12 * 60))}
                  </Button>
                )}
              </div>
            ) : (
              <div role="radiogroup" aria-labelledby="times-heading" className="space-y-5">
                {PERIODS.map((period) => {
                  const inPeriod = slots.filter((s) => s.startMinutes >= period.from && s.startMinutes < period.to)
                  if (!inPeriod.length) return null
                  return (
                    <div key={period.label} className="space-y-2">
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{period.label}</p>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                        {inPeriod.map((s) => {
                          const active = s.startMinutes === startMinutes && s.available
                          return (
                            <button
                              key={s.startMinutes}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              disabled={!s.available}
                              onClick={() => setStartMinutes(s.startMinutes)}
                              aria-label={s.available ? formatClock(s.startMinutes) : `${formatClock(s.startMinutes)}, taken`}
                              className={cn(
                                "h-12 rounded-xl text-[15px] font-semibold tabular-nums transition-all",
                                active
                                  ? "scale-[1.03] bg-primary text-primary-foreground shadow-lift"
                                  : s.available
                                    ? "bg-card shadow-soft ring-1 ring-foreground/[0.06] hover:ring-primary/50 active:scale-95"
                                    : "cursor-not-allowed bg-muted/60 text-muted-foreground/60 line-through",
                              )}
                            >
                              {formatClock(s.startMinutes)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Game */}
          <section aria-labelledby="game-heading" className="space-y-4">
            <h2 id="game-heading" className="text-lg font-semibold">Your game</h2>
            <div className="space-y-5 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/[0.06]">
              <div className="space-y-2">
                <p className="text-sm font-medium">Format</p>
                <div className="flex flex-wrap gap-2">
                  {formats.map((f) => (
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
                  <p className="text-sm font-medium">Players</p>
                  <p className="text-xs text-muted-foreground">Roughly how many are coming</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                  <button
                    type="button"
                    aria-label="Fewer players"
                    disabled={players <= 2}
                    onClick={() => setPlayers((p) => Math.max(2, p - 1))}
                    className="flex size-9 items-center justify-center rounded-full bg-card shadow-soft transition-transform active:scale-90 disabled:opacity-40"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-9 text-center text-base font-semibold tabular-nums" aria-live="polite">{players}</span>
                  <button
                    type="button"
                    aria-label="More players"
                    disabled={players >= maxPlayers}
                    onClick={() => setPlayers((p) => Math.min(maxPlayers, p + 1))}
                    className="flex size-9 items-center justify-center rounded-full bg-card shadow-soft transition-transform active:scale-90 disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section aria-labelledby="contact-heading" className="space-y-4">
            <div>
              <h2 id="contact-heading" className="text-lg font-semibold">Contact</h2>
              <p className="text-sm text-muted-foreground">The venue uses this if anything changes.</p>
            </div>
            <div className="space-y-4 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/[0.06]">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    ref={nameRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-phone">
                    Phone <span className="font-normal text-muted-foreground">(recommended)</span>
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+357 99 123456"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">
                  Note to venue <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Bibs needed, arriving early, birthday game…"
                  maxLength={500}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Summary — desktop */}
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <div className="overflow-hidden rounded-3xl bg-card shadow-lift ring-1 ring-foreground/[0.06]">
            <PitchArt seed={pitch.id} surface={pitch.surface} indoor={pitch.indoor} className="h-24">
              <div className="flex h-full items-end p-4 text-white">
                <div>
                  <p className="font-semibold drop-shadow">{pitch.venue?.name}</p>
                  <p className="text-xs text-white/80">{pitch.name}</p>
                </div>
              </div>
            </PitchArt>
            <div className="space-y-4 p-5">
              <dl className="space-y-2.5 text-sm">
                <SummaryRow label="When" value={selected ? formatFullDate(selected.start) : "—"} />
                <SummaryRow label="Time" value={selected ? `${formatTime(selected.start)}–${formatTime(selected.end)}` : "Pick a time"} muted={!selected} />
                <SummaryRow label="Game" value={`${format} · ${players} players`} />
              </dl>
              <div className="space-y-1.5 border-t pt-4 text-sm">
                {pitch.price_per_hour_cents ? (
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      {formatCurrency(pitch.price_per_hour_cents)} × {formatDurationMinutes(duration)}
                    </span>
                    <span className="tabular-nums">{formatCurrency(total)}</span>
                  </div>
                ) : null}
                <div className="flex items-baseline justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-xl tabular-nums">{total ? formatCurrency(total) : "Free"}</span>
                </div>
              </div>
              <Button size="lg" className="w-full" onClick={submit} disabled={submitting || !selected}>
                {submitting && <Loader2 className="animate-spin" />}
                {ctaLabel}
              </Button>
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                You won&apos;t be charged now. Pay at the venue once they confirm.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Summary — phones */}
      <StickyActionBar className="lg:hidden" always>
        <div className="min-w-0 flex-1">
          {selected ? (
            <>
              <p className="text-lg leading-tight font-bold tabular-nums">{total ? formatCurrency(total) : "Free"}</p>
              <p className="truncate text-xs text-muted-foreground">{whenLabel}</p>
            </>
          ) : (
            <>
              <p className="leading-tight font-semibold">Pick a time</p>
              <p className="truncate text-xs text-muted-foreground">
                {formatDurationMinutes(duration)} · {pitch.price_per_hour_cents ? `${formatCurrency(pitch.price_per_hour_cents)}/hr` : "Free"}
              </p>
            </>
          )}
        </div>
        <Button size="lg" onClick={submit} disabled={submitting} aria-disabled={!selected} className={cn("px-6", !selected && "opacity-50")}>
          {submitting && <Loader2 className="animate-spin" />}
          {ctaLabel}
        </Button>
      </StickyActionBar>
    </div>
  )
}

function SummaryRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-right font-medium", muted && "text-muted-foreground")}>{value}</dd>
    </div>
  )
}

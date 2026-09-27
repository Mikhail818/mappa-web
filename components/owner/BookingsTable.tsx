"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, Phone, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/common/StatusBadge"
import { formatCurrency } from "@/lib/utils/format"
import { formatMonth, formatTime, relativeDayLabel, zonedParts } from "@/lib/utils/time"
import { confirmBooking, declineBooking } from "@/lib/api/owner"
import { cn } from "@/lib/utils"

type Booking = {
  id: string; status: string; starts_at: string; ends_at: string
  format: string; player_count: number; total_price_cents: number | null
  contact_name: string | null; contact_phone: string | null; notes: string | null
  pitch: { name: string; venue: { name: string; city: string } } | null
  requester: { full_name: string; email: string | null } | null
}

const TABS = [
  { key: "pending", label: "Requests" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "declined", label: "Declined" },
] as const
type Tab = (typeof TABS)[number]["key"]

const EMPTY: Record<Tab, string> = {
  pending: "No requests waiting. New ones will show up here.",
  upcoming: "No confirmed bookings coming up.",
  past: "No past bookings yet.",
  declined: "Nothing declined or cancelled.",
}

export function BookingsTable({ bookings, ownerId, nowIso }: { bookings: Booking[]; ownerId: string; nowIso: string }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("pending")
  const [actioning, setActioning] = useState<string | null>(null)
  const [declining, setDeclining] = useState<Booking | null>(null)

  const now = new Date(nowIso)
  const groups: Record<Tab, Booking[]> = {
    pending: bookings.filter((b) => b.status === "requested" && b.ends_at >= nowIso),
    upcoming: bookings.filter((b) => b.status === "confirmed" && b.ends_at >= nowIso),
    past: bookings.filter((b) => b.status === "confirmed" && b.ends_at < nowIso).reverse(),
    declined: bookings.filter((b) => ["cancelled", "declined"].includes(b.status)).reverse(),
  }

  async function handleConfirm(b: Booking) {
    setActioning(b.id)
    try {
      await confirmBooking(b.id, ownerId)
      toast.success("Booking confirmed", { description: `${b.contact_name ?? b.requester?.full_name} has been notified.` })
      router.refresh()
    } catch {
      toast.error("Couldn't confirm — the slot may have been taken")
    } finally {
      setActioning(null)
    }
  }

  async function handleDecline() {
    if (!declining) return
    const b = declining
    setActioning(b.id)
    try {
      await declineBooking(b.id, ownerId)
      toast.success("Request declined")
      setDeclining(null)
      router.refresh()
    } catch {
      toast.error("Couldn't decline this request")
    } finally {
      setActioning(null)
    }
  }

  const list = groups[tab]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-1 rounded-2xl bg-muted p-1 sm:inline-grid sm:w-auto" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-xl px-2 py-2 text-[13px] font-semibold transition-all sm:px-4 sm:text-sm",
              tab === t.key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {groups[t.key].length > 0 && t.key === "pending" && (
              <span className="ml-1 rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">{groups[t.key].length}</span>
            )}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-card/50 px-4 py-10 text-center text-sm text-muted-foreground">{EMPTY[tab]}</p>
      ) : (
        <ul className="space-y-3">
          {list.map((b) => {
            const start = new Date(b.starts_at)
            const end = new Date(b.ends_at)
            const name = b.contact_name || b.requester?.full_name || "Guest"
            return (
              <li key={b.id} className="rounded-2xl bg-card p-4 shadow-soft ring-1 ring-foreground/[0.06]">
                <div className="flex gap-4">
                  <div className="flex w-14 shrink-0 flex-col items-center self-start overflow-hidden rounded-xl ring-1 ring-foreground/[0.06]">
                    <span className="w-full bg-primary py-0.5 text-center text-[10px] font-bold tracking-wider text-primary-foreground uppercase">
                      {formatMonth(start)}
                    </span>
                    <span className="py-1 text-xl font-semibold tabular-nums">{zonedParts(start).day}</span>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-semibold">{name}</p>
                      {b.total_price_cents ? (
                        <span className="shrink-0 font-semibold tabular-nums">{formatCurrency(b.total_price_cents)}</span>
                      ) : null}
                    </div>
                    <p className="text-sm">
                      {relativeDayLabel(start, now)} · {formatTime(start)}–{formatTime(end)}
                    </p>
                    <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                      <span>{b.pitch?.venue?.name} · {b.pitch?.name}</span>
                      <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{b.format} · {b.player_count}</span>
                    </p>
                    {b.contact_phone && (
                      <a href={`tel:${b.contact_phone}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                        <Phone className="size-3.5" /> {b.contact_phone}
                      </a>
                    )}
                    {b.notes && <p className="rounded-xl bg-muted px-3 py-2 text-sm">&ldquo;{b.notes}&rdquo;</p>}
                    {tab !== "pending" && <StatusBadge status={tab === "past" ? "completed" : b.status} className="mt-1" />}
                  </div>
                </div>
                {tab === "pending" && (
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:ml-18 sm:flex sm:justify-end">
                    <Button
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={actioning === b.id}
                      onClick={() => setDeclining(b)}
                    >
                      Decline
                    </Button>
                    <Button disabled={actioning === b.id} onClick={() => handleConfirm(b)}>
                      <Check /> Confirm
                    </Button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <Dialog open={!!declining} onOpenChange={(o) => !o && setDeclining(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Decline this request?</DialogTitle>
            <DialogDescription>
              {declining?.contact_name || declining?.requester?.full_name} will be told the slot isn&apos;t available, and it
              opens up for other players.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclining(null)}>Keep</Button>
            <Button variant="destructive" onClick={handleDecline} disabled={!!actioning}>Decline</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

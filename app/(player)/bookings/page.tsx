import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { PageHeader } from "@/components/common/PageHeader"
import { StatusBadge } from "@/components/common/StatusBadge"
import { EmptyState } from "@/components/common/EmptyState"
import { formatCurrency } from "@/lib/utils/format"
import { formatMonth, formatTime, relativeDayLabel, zonedParts } from "@/lib/utils/time"
import { cn } from "@/lib/utils"
import { CalendarCheck, ChevronRight, History, Plus } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Bookings" }

interface Row {
  id: string
  status: string
  starts_at: string
  ends_at: string
  format: string
  total_price_cents: number | null
  pitch: { name: string; venue: { name: string; city: string } | null } | null
}

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data } = await supabase
    .from("football_bookings")
    .select(`id, status, starts_at, ends_at, format, total_price_cents, pitch:football_pitches(name, venue:football_venues(name, city))`)
    .eq("requester_id", user.id)
    .order("starts_at", { ascending: true })

  const bookings = (data ?? []) as unknown as Row[]
  const now = new Date()
  const nowIso = now.toISOString()
  const isLive = (b: Row) => b.ends_at >= nowIso && ["requested", "confirmed"].includes(b.status)
  const upcoming = bookings.filter(isLive)
  const past = bookings.filter((b) => !isLive(b)).reverse()
  const showPast = tab === "past"
  const list = showPast ? past : upcoming

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Bookings"
        action={
          <Link href="/pitches" className={cn(buttonVariants({ size: "sm" }), "rounded-full")}>
            <Plus /> New
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1" role="tablist">
        {[
          { label: "Upcoming", href: "/bookings", active: !showPast, count: upcoming.length },
          { label: "Past", href: "/bookings?tab=past", active: showPast, count: past.length },
        ].map((t) => (
          <Link
            key={t.label}
            href={t.href}
            role="tab"
            aria-selected={t.active}
            replace
            scroll={false}
            className={cn(
              "rounded-xl py-2 text-center text-sm font-semibold transition-all",
              t.active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.count > 0 && <span className="ml-1.5 font-medium text-muted-foreground">{t.count}</span>}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        showPast ? (
          <EmptyState icon={<History className="size-7" />} title="No past bookings" description="Games you've played will show up here." />
        ) : (
          <EmptyState
            icon={<CalendarCheck className="size-7" />}
            title="Nothing booked yet"
            description="Find a pitch near you and grab a time — it takes under a minute."
            action={<Link href="/pitches" className={buttonVariants({ size: "lg" })}>Find a pitch</Link>}
          />
        )
      ) : (
        <ul className="space-y-3">
          {list.map((b) => (
            <li key={b.id}>
              <BookingRow booking={b} now={now} dim={showPast} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function BookingRow({ booking: b, now, dim }: { booking: Row; now: Date; dim: boolean }) {
  const start = new Date(b.starts_at)
  const end = new Date(b.ends_at)
  const status = b.status === "confirmed" && end < now ? "completed" : b.status
  return (
    <Link
      href={`/bookings/${b.id}`}
      className="flex items-center gap-4 rounded-2xl bg-card p-3 pr-4 shadow-soft ring-1 ring-foreground/[0.06] transition-all hover:ring-foreground/15 active:scale-[0.99]"
    >
      <div
        className={cn(
          "flex w-14 shrink-0 flex-col items-center overflow-hidden rounded-xl ring-1 ring-foreground/[0.06]",
          dim && "opacity-60",
        )}
      >
        <span className="w-full bg-primary py-0.5 text-center text-[10px] font-bold tracking-wider text-primary-foreground uppercase">
          {formatMonth(start)}
        </span>
        <span className="py-1 text-xl font-semibold tabular-nums">{zonedParts(start).day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{b.pitch?.venue?.name ?? "Pitch"}</p>
        <p className="truncate text-sm text-muted-foreground">
          {relativeDayLabel(start, now)} · {formatTime(start)}–{formatTime(end)}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <StatusBadge status={status} />
          <span className="truncate text-xs text-muted-foreground">
            {b.pitch?.name} · {b.format}
            {b.total_price_cents ? ` · ${formatCurrency(b.total_price_cents)}` : ""}
          </span>
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
    </Link>
  )
}

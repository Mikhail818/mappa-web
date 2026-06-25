import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { StatusBadge } from "@/components/common/StatusBadge"
import { EmptyState } from "@/components/common/EmptyState"
import { formatDate, formatCurrency } from "@/lib/utils/format"
import { Calendar, MapPin, ChevronRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Bookings" }

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: bookings } = await supabase
    .from("football_bookings")
    .select(`*, pitch:football_pitches(name, venue:football_venues(name, city))`)
    .eq("requester_id", user.id)
    .order("starts_at", { ascending: false })

  const now = new Date().toISOString()
  const upcoming = (bookings ?? []).filter((b) => b.starts_at >= now && !["cancelled", "declined"].includes(b.status))
  const past = (bookings ?? []).filter((b) => b.starts_at < now || ["cancelled", "declined"].includes(b.status))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <Link href="/pitches" className={buttonVariants({ variant: "outline", size: "sm" })}>Book a pitch</Link>
      </div>

      {(bookings?.length ?? 0) === 0 ? (
        <EmptyState
          icon={<Calendar className="h-7 w-7" />}
          title="No bookings yet"
          description="Book a pitch to get started"
          action={<Link href="/pitches" className={buttonVariants()}>Find Pitches</Link>}
        />
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((b) => <BookingRow key={b.id} booking={b} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3 text-muted-foreground">Past</h2>
              <div className="space-y-3">
                {past.map((b) => <BookingRow key={b.id} booking={b} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function BookingRow({ booking }: { booking: Record<string, unknown> }) {
  const b = booking as {
    id: string; status: string; starts_at: string; ends_at: string; format: string
    total_price_cents: number | null
    pitch: { name: string; venue: { name: string; city: string } } | null
  }
  return (
    <Link href={`/bookings/${b.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{b.pitch?.venue?.name}</p>
                <StatusBadge status={b.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{b.pitch?.name} · {b.format}</p>
              <p className="text-xs text-muted-foreground">{formatDate(b.starts_at)}</p>
            </div>
            <div className="text-right shrink-0">
              {b.total_price_cents && (
                <p className="font-semibold text-primary">{formatCurrency(b.total_price_cents)}</p>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/common/StatusBadge"
import { formatDate, formatCurrency } from "@/lib/utils/format"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { confirmBooking, declineBooking } from "@/lib/api/owner"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"

type Booking = {
  id: string; status: string; starts_at: string; ends_at: string
  format: string; player_count: number; total_price_cents: number | null
  contact_phone: string | null; notes: string | null
  pitch: { name: string; venue: { name: string; city: string } } | null
  requester: { full_name: string; email: string | null } | null
}

export function BookingsTable({ bookings, ownerId }: { bookings: Booking[]; ownerId: string }) {
  const router = useRouter()
  const [actioning, setActioning] = useState<string | null>(null)

  const pending = bookings.filter((b) => b.status === "requested")
  const upcoming = bookings.filter((b) => b.status === "confirmed" && b.starts_at >= new Date().toISOString())
  const past = bookings.filter((b) => b.status === "confirmed" && b.starts_at < new Date().toISOString())
  const declined = bookings.filter((b) => ["cancelled", "declined"].includes(b.status))

  async function handleConfirm(bookingId: string) {
    setActioning(bookingId)
    try { await confirmBooking(bookingId, ownerId); toast.success("Booking confirmed"); router.refresh() }
    catch { toast.error("Failed to confirm") }
    finally { setActioning(null) }
  }

  async function handleDecline(bookingId: string) {
    setActioning(bookingId)
    try { await declineBooking(bookingId, ownerId); toast.success("Booking declined"); router.refresh() }
    catch { toast.error("Failed to decline") }
    finally { setActioning(null) }
  }

  function BookingCard({ b, showActions }: { b: Booking; showActions?: boolean }) {
    return (
      <Card className="mb-2">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{b.requester?.full_name}</p>
                <StatusBadge status={b.status} />
              </div>
              <p className="text-xs text-muted-foreground">{b.pitch?.venue?.name} · {b.pitch?.name}</p>
              <p className="text-xs text-muted-foreground">{formatDate(b.starts_at)} · {b.format} · {b.player_count} players</p>
              {b.contact_phone && <p className="text-xs text-muted-foreground">Phone: {b.contact_phone}</p>}
              {b.notes && <p className="text-xs italic text-muted-foreground">&ldquo;{b.notes}&rdquo;</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {b.total_price_cents && (
                <span className="font-semibold text-primary">{formatCurrency(b.total_price_cents)}</span>
              )}
              {showActions && (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 border-green-500 text-green-600 hover:bg-green-50"
                    disabled={actioning === b.id}
                    onClick={() => handleConfirm(b.id)}
                  >
                    <Check className="h-3 w-3" /> Confirm
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 border-red-400 text-red-500 hover:bg-red-50"
                    disabled={actioning === b.id}
                    onClick={() => handleDecline(b.id)}
                  >
                    <X className="h-3 w-3" /> Decline
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="pending">
      <TabsList>
        <TabsTrigger value="pending">Pending {pending.length > 0 && `(${pending.length})`}</TabsTrigger>
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
        <TabsTrigger value="declined">Declined</TabsTrigger>
      </TabsList>

      <div className="mt-4">
        <TabsContent value="pending">
          {pending.length === 0
            ? <p className="text-muted-foreground text-sm">No pending requests</p>
            : pending.map((b) => <BookingCard key={b.id} b={b} showActions />)}
        </TabsContent>
        <TabsContent value="upcoming">
          {upcoming.length === 0
            ? <p className="text-muted-foreground text-sm">No upcoming bookings</p>
            : upcoming.map((b) => <BookingCard key={b.id} b={b} />)}
        </TabsContent>
        <TabsContent value="past">
          {past.length === 0
            ? <p className="text-muted-foreground text-sm">No past bookings</p>
            : past.map((b) => <BookingCard key={b.id} b={b} />)}
        </TabsContent>
        <TabsContent value="declined">
          {declined.length === 0
            ? <p className="text-muted-foreground text-sm">No declined/cancelled bookings</p>
            : declined.map((b) => <BookingCard key={b.id} b={b} />)}
        </TabsContent>
      </div>
    </Tabs>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { cancelBooking } from "@/lib/api/bookings"
import { toast } from "sonner"
import { X } from "lucide-react"

interface Props { bookingId: string; userId: string; isCancellable: boolean }

export function CancelBookingButton({ bookingId, userId, isCancellable }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function confirm() {
    setLoading(true)
    try {
      await cancelBooking(bookingId, userId)
      toast.success("Booking cancelled")
      router.refresh()
      setOpen(false)
    } catch { toast.error("Failed to cancel booking") }
    finally { setLoading(false) }
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full gap-2 text-destructive border-destructive hover:bg-destructive/10"
        onClick={() => setOpen(true)}
      >
        <X className="h-4 w-4" /> Cancel Booking
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              {isCancellable
                ? "Are you sure you want to cancel? You can book again anytime."
                : "This booking is within 24 hours. Late cancellations may incur a fee."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Keep Booking</Button>
            <Button variant="destructive" onClick={confirm} disabled={loading}>
              {loading ? "Cancelling…" : "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

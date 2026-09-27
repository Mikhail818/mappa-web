"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { cancelBooking } from "@/lib/api/bookings"
import { toast } from "sonner"

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
        variant="ghost"
        size="lg"
        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        Cancel booking
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              {isCancellable
                ? "The slot will be released for other players. You can always book again."
                : "Kick-off is less than 24 hours away, so the venue may charge a late-cancellation fee."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Keep booking</Button>
            <Button variant="destructive" onClick={confirm} disabled={loading}>
              {loading ? "Cancelling…" : "Cancel booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import { CalendarPlus, Navigation, Phone, Share } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Props {
  bookingId: string
  title: string
  location: string
  startsAt: string
  endsAt: string
  shareText: string
  mapsHref: string
  phone?: string | null
  showCalendar: boolean
}

function icsDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

function icsEscape(s: string) {
  return s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n")
}

function downloadIcs({ bookingId, title, location, startsAt, endsAt }: Props) {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mappa//Bookings//EN",
    "BEGIN:VEVENT",
    `UID:${bookingId}@mappa`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(startsAt)}`,
    `DTEND:${icsDate(endsAt)}`,
    `SUMMARY:${icsEscape(title)}`,
    `LOCATION:${icsEscape(location)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }))
  const a = document.createElement("a")
  a.href = url
  a.download = "mappa-booking.ics"
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const tile =
  "flex flex-col items-center gap-1.5 rounded-2xl bg-card px-2 py-3.5 text-xs font-medium shadow-soft ring-1 ring-foreground/[0.06] transition-all hover:ring-primary/40 active:scale-95"

export function BookingActions(props: Props) {
  async function share() {
    const data = { title: props.title, text: props.shareText }
    try {
      if (navigator.share) {
        await navigator.share(data)
        return
      }
      await navigator.clipboard.writeText(props.shareText)
      toast.success("Details copied", { description: "Paste them into your team chat." })
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") toast.error("Couldn't share right now")
    }
  }

  const count = 2 + Number(props.showCalendar) + Number(!!props.phone)

  return (
    <div className={cn("grid gap-2", count === 4 ? "grid-cols-4" : count === 3 ? "grid-cols-3" : "grid-cols-2")}>
      {props.showCalendar && (
        <button type="button" onClick={() => downloadIcs(props)} className={tile}>
          <CalendarPlus className="size-5 text-primary" />
          Calendar
        </button>
      )}
      <a href={props.mapsHref} target="_blank" rel="noopener noreferrer" className={tile}>
        <Navigation className="size-5 text-primary" />
        Directions
      </a>
      <button type="button" onClick={share} className={tile}>
        <Share className="size-5 text-primary" />
        Share
      </button>
      {props.phone && (
        <a href={`tel:${props.phone}`} className={tile}>
          <Phone className="size-5 text-primary" />
          Call
        </a>
      )}
    </div>
  )
}

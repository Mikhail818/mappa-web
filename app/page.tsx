import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Logo } from "@/components/brand/Logo"
import { PublicHeader } from "@/components/layout/PublicHeader"
import { PitchArt } from "@/components/pitches/PitchArt"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"
import { ArrowRight, CalendarCheck, Clock, MapPin, ShieldCheck, Swords, Users } from "lucide-react"

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Book in three taps",
    body: "Pick a day, tap a free time, send. Live availability means no phone tag and no double bookings.",
  },
  {
    icon: Users,
    title: "Never short of players",
    body: "Post an open game and let nearby players fill the spots — or join one tonight.",
  },
  {
    icon: Swords,
    title: "Find your level",
    body: "Challenge players with a similar rating to a 1v1 and track your record as you climb.",
  },
]

const STEPS = [
  { icon: MapPin, title: "Find a pitch", body: "Search by city, format or floodlights." },
  { icon: Clock, title: "Tap a time", body: "Only real, open slots are shown." },
  { icon: ShieldCheck, title: "Play", body: "Pay at the venue. Free cancellation up to 24h before." },
]

/** A faithful, static rendering of the in-app time picker for the hero. */
function PhonePreview() {
  const times = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00"]
  const taken = new Set(["18:00", "21:00"])
  return (
    <div className="relative mx-auto w-[280px] rounded-[44px] bg-neutral-900 p-2.5 shadow-2xl ring-1 ring-white/10">
      <div className="overflow-hidden rounded-[36px] bg-background text-foreground">
        <div className="flex justify-center pt-2.5">
          <span className="h-6 w-24 rounded-full bg-neutral-900" />
        </div>
        <div className="space-y-4 p-4 pt-3">
          <div>
            <p className="text-[11px] text-primary">‹ Limassol Arena</p>
            <p className="text-xl font-bold tracking-tight">Choose a time</p>
          </div>
          <div className="flex gap-1.5">
            {[["Today", "4"], ["Sun", "5"], ["Mon", "6"], ["Tue", "7"]].map(([d, n], i) => (
              <div
                key={d}
                className={cn(
                  "flex flex-1 flex-col items-center rounded-xl py-1.5",
                  i === 0 ? "bg-foreground text-background" : "bg-card shadow-soft ring-1 ring-foreground/[0.06]",
                )}
              >
                <span className="text-[9px] font-medium uppercase opacity-70">{d}</span>
                <span className="text-sm font-semibold">{n}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-1.5 text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">Evening</p>
            <div className="grid grid-cols-3 gap-1.5">
              {times.map((t) => (
                <div
                  key={t}
                  className={cn(
                    "rounded-lg py-2 text-center text-xs font-semibold",
                    t === "19:00"
                      ? "bg-primary text-primary-foreground shadow-lift"
                      : taken.has(t)
                        ? "bg-muted/60 text-muted-foreground/60 line-through"
                        : "bg-card shadow-soft ring-1 ring-foreground/[0.06]",
                  )}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-card p-3 shadow-soft ring-1 ring-foreground/[0.06]">
            <div>
              <p className="text-sm font-bold">€60</p>
              <p className="text-[10px] text-muted-foreground">Today · 19:00–20:30</p>
            </div>
            <span className="rounded-xl bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground">
              Request booking
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const primaryHref = user ? "/pitches" : "/register"

  return (
    <main className="min-h-screen bg-background">
      <PublicHeader signedIn={!!user} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-40 h-[480px] bg-[radial-gradient(ellipse_at_center,oklch(0.7_0.16_155/0.25),transparent_65%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
          <div className="space-y-6 text-center lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-semibold shadow-soft ring-1 ring-foreground/[0.06]">
              <span className="size-1.5 rounded-full bg-primary" /> Football across Cyprus
            </p>
            <h1 className="text-5xl leading-[1.02] font-bold tracking-tighter sm:text-6xl lg:text-7xl">
              Your next game,
              <br />
              <span className="bg-gradient-to-r from-[oklch(0.55_0.15_155)] to-[oklch(0.7_0.18_135)] bg-clip-text text-transparent">
                booked in seconds.
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground sm:text-xl lg:mx-0">
              See every open slot at pitches in Nicosia, Limassol, Larnaca and Paphos. Tap a time, fill your team, play.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href={primaryHref} className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8")}>
                {user ? "Find a pitch" : "Get started — it's free"} <ArrowRight />
              </Link>
              {!user && (
                <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8")}>
                  I have an account
                </Link>
              )}
            </div>
          </div>
          <PhonePreview />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Everything between &ldquo;who&apos;s up for a game?&rdquo; and kick-off.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-3xl bg-card p-7 shadow-soft ring-1 ring-foreground/[0.06]">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <PitchArt seed="how-it-works" subtle className="rounded-[2rem] shadow-lift">
          <div className="grid gap-8 p-8 text-white sm:p-12 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="space-y-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-md">
                  <Icon className="size-5" />
                </span>
                <p className="text-sm font-semibold text-white/70">Step {i + 1}</p>
                <h3 className="text-2xl font-bold">{title}</h3>
                <p className="text-white/85">{body}</p>
              </div>
            ))}
          </div>
        </PitchArt>
      </section>

      {/* Venues */}
      <section className="border-y bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-12 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Run a venue?</h2>
            <p className="mt-1 text-muted-foreground">Fill empty hours with players already looking for a pitch.</p>
          </div>
          <Link href={user ? "/apply-owner" : "/register"} className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "rounded-full px-8")}>
            List your venue
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row">
        <Logo className="text-base text-foreground" markClassName="size-6" />
        <nav className="flex gap-5">
          <Link href="/pitches" className="hover:text-foreground">Pitches</Link>
          <Link href="/login" className="hover:text-foreground">Sign in</Link>
          <Link href="/register" className="hover:text-foreground">Create account</Link>
        </nav>
        <p>© {new Date().getFullYear()} Mappa · Made in Cyprus</p>
      </footer>
    </main>
  )
}

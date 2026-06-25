import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Swords, CalendarCheck, Users, MapPin, Trophy, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-bold text-xl text-primary tracking-tight">Mappa</div>
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>Sign in</Link>
            <Link href="/register" className={buttonVariants({ size: "sm" })}>Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[oklch(0.18_0.03_264)] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.43_0.12_155)]/40 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 lg:py-36 text-center space-y-6">
          <div className="inline-block bg-[oklch(0.93_0.19_120)] text-[oklch(0.18_0.03_264)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            Cyprus Football Community
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
            Find your match.<br />
            <span className="text-[oklch(0.93_0.19_120)]">Book your pitch.</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
            Mappa connects football players across Cyprus for 1v1 matches, group games, and pitch bookings. Your skill level, your schedule, your game.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "text-base h-12 px-8 bg-[oklch(0.93_0.19_120)] text-[oklch(0.18_0.03_264)] hover:bg-[oklch(0.90_0.19_120)] font-bold")}
            >
              Join for free
            </Link>
            <Link
              href="/pitches"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-base h-12 px-8 border-white/30 text-white hover:bg-white/10")}
            >
              Browse pitches
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Everything you need to play</h2>
          <p className="text-muted-foreground">From finding opponents to booking pitches — all in one place.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Swords className="h-7 w-7 text-primary" />,
              title: "1v1 Matchmaking",
              desc: "Get matched with players at your skill level based on MMR rating, availability, and location.",
            },
            {
              icon: <Users className="h-7 w-7 text-blue-500" />,
              title: "Open Lobbies",
              desc: "Create or join group games. Set your format, time, and location — let others fill the spots.",
            },
            {
              icon: <CalendarCheck className="h-7 w-7 text-green-500" />,
              title: "Pitch Booking",
              desc: "Browse and book pitches across Cyprus. Instant availability, clear pricing, easy cancellation.",
            },
            {
              icon: <Trophy className="h-7 w-7 text-yellow-500" />,
              title: "Skill Tracking",
              desc: "Your performance matters. Submit scores, track your MMR, and climb the skill ladder.",
            },
            {
              icon: <MapPin className="h-7 w-7 text-red-500" />,
              title: "Venues Across Cyprus",
              desc: "Pitches in Nicosia, Limassol, Larnaca, Paphos and more — with live availability.",
            },
            {
              icon: <Zap className="h-7 w-7 text-primary" />,
              title: "Instant Match Chat",
              desc: "Coordinate with your opponent or lobby via real-time in-app messaging.",
            },
          ].map(({ icon, title, desc }) => (
            <Card key={title} className="border-0 bg-muted/50">
              <CardContent className="pt-6 pb-6 space-y-3">
                <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center">{icon}</div>
                <h3 className="font-bold text-base">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="text-muted-foreground">Get on the pitch in minutes.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { step: "1", title: "Create your profile", desc: "Set your skill level, city, and availability. Mappa calculates your MMR from your match results." },
              { step: "2", title: "Find players or pitches", desc: "Browse players for 1v1 challenges, join open lobbies, or book a pitch for your group." },
              { step: "3", title: "Play and progress", desc: "Submit scores, build your record, unlock badges, and move up the skill ladder." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="space-y-3">
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-2xl font-black">{step}</div>
                <h3 className="font-bold text-base">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[oklch(0.43_0.12_155)] text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to play?</h2>
          <p className="text-white/80 text-lg">Join hundreds of players already on Mappa. It&apos;s free to sign up.</p>
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "lg" }), "bg-[oklch(0.93_0.19_120)] text-[oklch(0.18_0.03_264)] hover:bg-[oklch(0.90_0.19_120)] font-bold text-base h-12 px-10")}
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="font-bold text-base text-primary">Mappa</div>
          <div className="flex gap-4">
            <Link href="/pitches" className="hover:text-foreground">Pitches</Link>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
            <Link href="/register" className="hover:text-foreground">Register</Link>
            <Link href="/apply-owner" className="hover:text-foreground">List a venue</Link>
          </div>
          <p>© {new Date().getFullYear()} Mappa. Cyprus.</p>
        </div>
      </footer>
    </main>
  )
}

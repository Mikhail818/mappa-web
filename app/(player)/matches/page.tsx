import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MatchCard } from "@/components/matches/MatchCard"
import { EmptyState } from "@/components/common/EmptyState"
import { PageHeader } from "@/components/common/PageHeader"
import { PlaySwitch } from "@/components/common/PlaySwitch"
import { Swords } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My 1v1s" }

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: allMatches } = await supabase
    .from("matches")
    .select(`*, player:profiles!matches_player_id_fkey(*), opponent:profiles!matches_opponent_id_fkey(*), court:courts(name, city)`)
    .or(`player_id.eq.${user.id},opponent_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  const matches = allMatches ?? []
  const upcoming = matches.filter((m) => ["confirmed"].includes(m.status))
  const pending = matches.filter((m) => m.status === "pending")
  const completed = matches.filter((m) => ["completed", "disputed"].includes(m.status))

  return (
    <div className="space-y-6">
      <PageHeader title="Play" subtitle="Your 1v1 challenges and results." />
      <PlaySwitch active="matches" />
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        {[
          { value: "upcoming", items: upcoming },
          { value: "pending", items: pending },
          { value: "completed", items: completed },
        ].map(({ value, items }) => (
          <TabsContent key={value} value={value} className="space-y-3 mt-4">
            {items.length === 0 ? (
              <EmptyState
                icon={<Swords className="h-7 w-7" />}
                title="No matches here"
                description="Challenge a player at your level from the Players tab."
                action={<Link href="/players" className={buttonVariants()}>Find a player</Link>}
              />
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              items.map((m) => <MatchCard key={m.id} match={m as any} currentUserId={user.id} />)
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

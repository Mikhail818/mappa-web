import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MatchCard } from "@/components/matches/MatchCard"
import { EmptyState } from "@/components/common/EmptyState"
import { Swords } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Matches" }

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
      <h1 className="text-2xl font-bold">My Matches</h1>
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
                description="Go to Players to send a match request"
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

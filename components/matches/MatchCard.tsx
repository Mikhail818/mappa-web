import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/common/StatusBadge"
import { formatDate } from "@/lib/utils/format"
import { MapPin, ChevronRight } from "lucide-react"
import type { Profile, Court } from "@/types/database.types"

interface MatchRow {
  id: string
  status: string
  scheduled_at: string | null
  player_id: string
  opponent_id: string
  player_sets: number | null
  opponent_sets: number | null
  player: Profile | null
  opponent: Profile | null
  court: Pick<Court, "name" | "city"> | null
}

export function MatchCard({ match, currentUserId }: { match: MatchRow; currentUserId: string }) {
  const isPlayer = match.player_id === currentUserId
  const me = isPlayer ? match.player : match.opponent
  const opponent = isPlayer ? match.opponent : match.player

  const opponentInitials = opponent?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Link href={`/matches/${match.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={opponent?.avatar_url ?? undefined} />
              <AvatarFallback className="text-sm bg-primary/10 text-primary">{opponentInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">vs {opponent?.full_name ?? "Unknown"}</p>
                <StatusBadge status={match.status} />
              </div>
              {match.scheduled_at && (
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(match.scheduled_at)}</p>
              )}
              {match.court && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> {match.court.name}, {match.court.city}
                </p>
              )}
              {match.status === "completed" && match.player_sets != null && (
                <p className="text-xs font-medium text-primary mt-0.5">
                  {isPlayer ? match.player_sets : match.opponent_sets} – {isPlayer ? match.opponent_sets : match.player_sets}
                </p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

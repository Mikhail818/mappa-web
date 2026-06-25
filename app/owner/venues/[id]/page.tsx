import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import { MapPin, ChevronLeft } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Venue Detail" }
interface Props { params: Promise<{ id: string }> }

export default async function OwnerVenueDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: adminEntry } = await supabase
    .from("football_venue_admins")
    .select("venue_id")
    .eq("user_id", user.id)
    .eq("venue_id", id)
    .maybeSingle()

  if (!adminEntry) notFound()

  const { data: venue } = await supabase
    .from("football_venues")
    .select(`*, pitches:football_pitches(*)`)
    .eq("id", id)
    .single()

  if (!venue) notFound()

  const pitches = venue.pitches as unknown as {
    id: string; name: string; format: string; price_per_hour_cents: number | null; is_active: boolean
  }[]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/owner/venues" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">{venue.name}</h1>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <MapPin className="h-4 w-4" />
        <span>{venue.city}{venue.address ? `, ${venue.address}` : ""}</span>
      </div>

      {venue.description && <p className="text-muted-foreground text-sm">{venue.description}</p>}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Pitches ({pitches.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {pitches.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.format}</p>
              </div>
              <div className="flex items-center gap-2">
                {p.price_per_hour_cents && (
                  <span className="text-sm font-semibold text-primary">{formatCurrency(p.price_per_hour_cents)}/hr</span>
                )}
                <Badge variant={p.is_active ? "default" : "secondary"}>
                  {p.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

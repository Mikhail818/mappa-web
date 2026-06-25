import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { formatTimeAgo } from "@/lib/utils/format"
import { GitBranch } from "lucide-react"
import { EmptyState } from "@/components/common/EmptyState"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Referrals" }

export default async function AdminReferralsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: referrers } = await supabase
    .from("profiles")
    .select("id, full_name, referral_code, referred_by")
    .not("referred_by", "is", null)
    .order("created_at", { ascending: false })
    .limit(50)

  const refCounts: Record<string, number> = {}
  ;(referrers ?? []).forEach((p) => {
    if (p.referred_by) refCounts[p.referred_by] = (refCounts[p.referred_by] ?? 0) + 1
  })

  const topReferrers = Object.entries(refCounts).sort((a, b) => b[1] - a[1]).slice(0, 20)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Referrals</h1>
      {topReferrers.length === 0 ? (
        <EmptyState
          icon={<GitBranch className="h-7 w-7" />}
          title="No referrals yet"
          description="Referral data will appear here once players start inviting friends"
        />
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{referrers?.length ?? 0} players have been referred</p>
          {topReferrers.map(([code, count]) => (
            <Card key={code}>
              <CardContent className="pt-3 pb-3 flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-bold">{code}</p>
                  <p className="text-xs text-muted-foreground">Referral code</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{count}</p>
                  <p className="text-xs text-muted-foreground">referrals</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

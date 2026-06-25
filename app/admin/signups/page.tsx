import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { SkillBadge } from "@/components/common/SkillBadge"
import { formatTimeAgo } from "@/lib/utils/format"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "New Signups" }

export default async function AdminSignupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: signups } = await supabase
    .from("profiles")
    .select("id, full_name, email, home_city, skill_level, created_at, onboarding_completed, referral_code")
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Signups</h1>
      <div className="space-y-2">
        {(signups ?? []).map((p) => (
          <Card key={p.id}>
            <CardContent className="pt-3 pb-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                {(p.full_name ?? "?")[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{p.full_name}</p>
                <p className="text-xs text-muted-foreground">{p.email} · {p.home_city}</p>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <SkillBadge level={p.skill_level ?? ""} />
                <p className="text-xs text-muted-foreground">{formatTimeAgo(p.created_at)}</p>
              </div>
              <div className="text-xs shrink-0">
                {p.onboarding_completed
                  ? <span className="text-green-600">Onboarded</span>
                  : <span className="text-yellow-600">Pending</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

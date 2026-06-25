import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Activation Funnel" }

export default async function AdminFunnelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [
    { count: totalRegistered },
    { count: onboarded },
    { count: hadFirstMatch },
    { count: hadThreeMatches },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("onboarding_completed", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("wins", 1),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("wins", 3),
  ])

  const steps = [
    { label: "Registered", value: totalRegistered ?? 0, pct: 100 },
    { label: "Completed Onboarding", value: onboarded ?? 0, pct: totalRegistered ? Math.round(((onboarded ?? 0) / totalRegistered) * 100) : 0 },
    { label: "Played First Match", value: hadFirstMatch ?? 0, pct: totalRegistered ? Math.round(((hadFirstMatch ?? 0) / totalRegistered) * 100) : 0 },
    { label: "Played 3+ Matches", value: hadThreeMatches ?? 0, pct: totalRegistered ? Math.round(((hadThreeMatches ?? 0) / totalRegistered) * 100) : 0 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Activation Funnel</h1>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Player Journey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, i) => (
            <div key={step.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <span className="font-medium">{step.label}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{step.value.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1">({step.pct}%)</span>
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${step.pct}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

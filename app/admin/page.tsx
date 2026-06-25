import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Building2, TrendingUp, Activity, GitBranch, FileText, Award, UserCheck } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin Panel" }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [
    { count: totalPlayers },
    { count: totalVenues },
    { count: pendingApplications },
    { count: newSignups7d },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("football_venues").select("id", { count: "exact", head: true }),
    supabase.from("venue_owner_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 86400 * 1000).toISOString()),
  ])

  const stats = [
    { label: "Total Players", value: totalPlayers ?? 0, icon: <Users className="h-5 w-5 text-primary" />, href: "/admin/players" },
    { label: "Venues", value: totalVenues ?? 0, icon: <Building2 className="h-5 w-5 text-blue-500" />, href: "/admin/quality" },
    { label: "Pending Applications", value: pendingApplications ?? 0, icon: <FileText className="h-5 w-5 text-yellow-500" />, href: "/admin/applications" },
    { label: "New Players (7d)", value: newSignups7d ?? 0, icon: <UserCheck className="h-5 w-5 text-green-500" />, href: "/admin/signups" },
  ]

  const sections = [
    { href: "/admin/cities", label: "City Health", icon: <Activity className="h-5 w-5" />, desc: "Engagement and activity by city" },
    { href: "/admin/funnel", label: "Activation Funnel", icon: <GitBranch className="h-5 w-5" />, desc: "Onboarding and conversion rates" },
    { href: "/admin/players", label: "Player Management", icon: <Users className="h-5 w-5" />, desc: "Search and view all players" },
    { href: "/admin/liquidity", label: "Liquidity Monitor", icon: <TrendingUp className="h-5 w-5" />, desc: "Match supply and demand balance" },
    { href: "/admin/quality", label: "Quality & Safety", icon: <Award className="h-5 w-5" />, desc: "Disputes, scores, and reports" },
    { href: "/admin/signups", label: "New Signups", icon: <UserCheck className="h-5 w-5" />, desc: "Recent registrations" },
    { href: "/admin/reports", label: "Reports", icon: <FileText className="h-5 w-5" />, desc: "Flagged content and users" },
    { href: "/admin/applications", label: "Owner Applications", icon: <Building2 className="h-5 w-5" />, desc: "Review venue applications" },
    { href: "/admin/referrals", label: "Referrals", icon: <GitBranch className="h-5 w-5" />, desc: "Referral program performance" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">{icon} {label}</div>
                <div className="text-3xl font-bold">{value.toLocaleString()}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map(({ href, label, icon, desc }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="pt-4 pb-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0 text-primary">{icon}</div>
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

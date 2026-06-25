import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EmptyState } from "@/components/common/EmptyState"
import { Flag } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Reports" }

export default async function AdminReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <EmptyState
        icon={<Flag className="h-7 w-7" />}
        title="No reports"
        description="No flagged content or users at this time"
      />
    </div>
  )
}

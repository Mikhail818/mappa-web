import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ApplicationsReview } from "./ApplicationsReview"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Owner Applications" }

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: applications } = await supabase
    .from("venue_owner_applications")
    .select(`*, applicant:profiles!venue_owner_applications_user_id_fkey(full_name, email)`)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Venue Owner Applications</h1>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ApplicationsReview applications={(applications ?? []) as any} adminId={user.id} />
    </div>
  )
}

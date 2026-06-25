import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ApplyOwnerForm } from "./ApplyOwnerForm"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Apply as Venue Owner" }

export default async function ApplyOwnerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: application } = await supabase
    .from("venue_owner_applications")
    .select("status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (application?.status === "approved") redirect("/owner")

  if (application?.status === "pending") {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
              <Clock className="h-7 w-7 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold">Application Under Review</h2>
            <p className="text-muted-foreground">
              We&apos;ve received your application. Our team will review it and get back to you within 2-3 business days.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).single()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Apply to List Your Venue</h1>
        <p className="text-muted-foreground text-sm mt-1">Join Mappa as a venue partner and reach players across Cyprus</p>
      </div>
      <ApplyOwnerForm userId={user.id} profile={profile} />
    </div>
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: adminEntry } = await supabase
    .from("football_venue_admins")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle()

  if (!adminEntry && !profile?.is_venue_owner) {
    redirect("/apply-owner")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar profile={profile} />
      <div className="flex flex-1">
        <Sidebar variant="owner" />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

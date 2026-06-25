import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/Navbar"

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
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

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar profile={profile} />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
    </div>
  )
}

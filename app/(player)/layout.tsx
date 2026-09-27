import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/Navbar"
import { TabBar } from "@/components/layout/TabBar"

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
    <div className="flex min-h-screen flex-col">
      <Navbar profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-28 md:pt-8 md:pb-12">{children}</main>
      <TabBar />
    </div>
  )
}

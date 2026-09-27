import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

  if (!profile?.is_founding_player) redirect("/home")

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar profile={profile} showNav={false} />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar variant="admin" />
        <main className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-4 pt-5 pb-16 md:px-8 md:pt-8">{children}</main>
      </div>
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: isAdmin } = await supabase.rpc("is_admin", { user_id: user.id })

  if (!isAdmin) {
    redirect("/app")
  }

  // Fetch dashboard metrics
  const { data: profiles, count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  const { data: subscriptions } = await supabase.from("subscriptions").select("*")

  const { data: sections, count: totalSections } = await supabase
    .from("sections")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(10)

  const { data: audioCache, count: totalAudioFiles } = await supabase
    .from("audio_cache")
    .select("*", { count: "exact" })

  const premiumUsers = subscriptions?.filter((s) => s.plan_type === "premium" && s.status === "active").length || 0

  return (
    <AdminDashboard
      totalUsers={totalUsers || 0}
      premiumUsers={premiumUsers}
      totalSections={totalSections || 0}
      totalAudioFiles={totalAudioFiles || 0}
      recentSections={sections || []}
      profiles={profiles || []}
      subscriptions={subscriptions || []}
    />
  )
}

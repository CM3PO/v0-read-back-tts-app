import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SectionsManager } from "@/components/sections-manager"

export default async function AppPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's sections
  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  // Fetch user's subscription
  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single()

  return (
    <div className="flex min-h-screen flex-col">
      <SectionsManager initialSections={sections || []} subscription={subscription} userEmail={user.email || ""} />
    </div>
  )
}

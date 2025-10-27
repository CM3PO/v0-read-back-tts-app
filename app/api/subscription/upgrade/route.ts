import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In production with iOS app, this would:
    // 1. Receive receipt data from the iOS app
    // 2. Verify the IAP receipt with Apple's servers using APPLE_SHARED_SECRET
    // 3. Only upgrade if receipt is valid

    // For now, directly upgrade the user (useful for testing)
    const { error } = await supabase.rpc("upgrade_to_premium", {
      user_id_param: user.id,
    })

    if (error) {
      console.error("[v0] Error upgrading subscription:", error)
      return NextResponse.json({ error: "Failed to upgrade subscription" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Upgraded to Premium successfully",
    })
  } catch (error) {
    console.error("[v0] Subscription upgrade error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

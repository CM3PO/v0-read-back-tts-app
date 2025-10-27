"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Crown, Mail, Calendar, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Subscription } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

interface SettingsContentProps {
  user: User
  subscription: Subscription | null
  profile: { id: string; email: string; created_at: string } | null
}

export function SettingsContent({ user, subscription, profile }: SettingsContentProps) {
  const router = useRouter()
  const [isUpgrading, setIsUpgrading] = useState(false)

  const isPremium = subscription?.plan_type === "premium" && subscription?.status === "active"

  const handleUpgrade = async () => {
    setIsUpgrading(true)

    try {
      // Call the upgrade API endpoint (works without Apple shared secret in dev mode)
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to upgrade subscription")
      }

      alert("Successfully upgraded to Premium! 🎉\n\nYou now have unlimited sections and premium voices.")

      // Refresh the page to show updated subscription status
      router.refresh()
    } catch (error) {
      console.error("[v0] Upgrade error:", error)
      alert("Upgrade failed. Please try again.\n\n" + "Note: In production, this will use Apple In-App Purchase.")
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/app")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-4 text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl space-y-6 p-4 py-8">
        {/* Account Information */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Account Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Member since:</span>
              <span className="font-medium">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </Card>

        {/* Subscription Status */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Subscription</h2>
            {isPremium && (
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                <Crown className="h-4 w-4" />
                <span className="font-medium">Premium</span>
              </div>
            )}
          </div>

          {isPremium ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-primary/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Premium Active</span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    Unlimited text sections
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    Access to premium voices
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    Priority support
                  </li>
                </ul>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  Started: {subscription?.start_date ? new Date(subscription.start_date).toLocaleDateString() : "N/A"}
                </p>
                {subscription?.end_date && <p>Renews: {new Date(subscription.end_date).toLocaleDateString()}</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <div className="mb-3 text-sm font-medium">Free Plan</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Up to 10 text sections
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />4 standard voices
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                  <Crown className="h-4 w-4" />
                  <span>Upgrade to Premium</span>
                </div>
                <ul className="mb-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    Unlimited text sections
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-primary" />2 premium voices
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    Priority support
                  </li>
                </ul>
                <div className="mb-4 text-2xl font-bold">$10.99/month</div>
                <Button className="w-full" onClick={handleUpgrade} disabled={isUpgrading}>
                  {isUpgrading ? "Processing..." : "Upgrade Now"}
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">Billed monthly via Apple In-App Purchase</p>
              </div>
            </div>
          )}
        </Card>

        {/* App Information */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">About ReadBack</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Version 1.0.0</p>
            <p>A text-to-speech notepad app for listening to your notes on the go.</p>
          </div>
        </Card>
      </main>
    </div>
  )
}

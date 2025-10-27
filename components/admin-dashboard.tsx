"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Crown, FileText, Volume2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Section, Subscription } from "@/lib/types"

interface AdminDashboardProps {
  totalUsers: number
  premiumUsers: number
  totalSections: number
  totalAudioFiles: number
  recentSections: Section[]
  profiles: Array<{ id: string; email: string; created_at: string }>
  subscriptions: Subscription[]
}

export function AdminDashboard({
  totalUsers,
  premiumUsers,
  totalSections,
  totalAudioFiles,
  recentSections,
  profiles,
  subscriptions,
}: AdminDashboardProps) {
  const router = useRouter()

  const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : "0.0"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/app")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-4 text-xl font-semibold">Admin Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto space-y-6 p-4 py-8">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Premium Users</p>
                <p className="text-3xl font-bold">{premiumUsers}</p>
                <p className="text-xs text-muted-foreground">{conversionRate}% conversion</p>
              </div>
              <Crown className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sections</p>
                <p className="text-3xl font-bold">{totalSections}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Audio Files Cached</p>
                <p className="text-3xl font-bold">{totalAudioFiles}</p>
              </div>
              <Volume2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Recent Sections */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Sections</h2>
          <div className="space-y-3">
            {recentSections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sections yet</p>
            ) : (
              recentSections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-start justify-between border-b border-border pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{section.title || "Untitled"}</p>
                    <p className="text-sm text-muted-foreground">
                      {section.content.substring(0, 100)}
                      {section.content.length > 100 ? "..." : ""}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(section.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* User List */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => {
                  const subscription = subscriptions.find((s) => s.user_id === profile.id)
                  const isPremium = subscription?.plan_type === "premium" && subscription?.status === "active"

                  return (
                    <tr key={profile.id} className="border-b border-border last:border-0">
                      <td className="py-3 text-sm">{profile.email}</td>
                      <td className="py-3">
                        {isPremium ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                            <Crown className="h-3 w-3" />
                            Premium
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Free</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-muted-foreground">{subscription?.status || "active"}</span>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}

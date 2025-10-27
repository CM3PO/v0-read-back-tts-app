"use client"

import { useState } from "react"
import type { Section, Subscription } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Volume2, Plus, LogOut, Crown, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { SectionsList } from "@/components/sections-list"
import { SectionEditor } from "@/components/section-editor"
import { FREE_SECTION_LIMIT } from "@/lib/types"

interface SectionsManagerProps {
  initialSections: Section[]
  subscription: Subscription | null
  userEmail: string
}

export function SectionsManager({ initialSections, subscription, userEmail }: SectionsManagerProps) {
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isPremium = subscription?.plan_type === "premium" && subscription?.status === "active"
  const canCreateMore = isPremium || sections.length < FREE_SECTION_LIMIT

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleCreateNew = () => {
    if (!canCreateMore) {
      alert(`Free users are limited to ${FREE_SECTION_LIMIT} sections. Upgrade to Premium for unlimited sections!`)
      return
    }
    setSelectedSection(null)
    setIsCreating(true)
  }

  const handleSelectSection = (section: Section) => {
    setSelectedSection(section)
    setIsCreating(false)
  }

  const handleSectionSaved = (section: Section) => {
    setSections((prev) => {
      const existing = prev.find((s) => s.id === section.id)
      if (existing) {
        return prev.map((s) => (s.id === section.id ? section : s))
      }
      return [section, ...prev]
    })
    setSelectedSection(section)
    setIsCreating(false)
  }

  const handleSectionDeleted = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId))
    setSelectedSection(null)
    setIsCreating(false)
  }

  return (
    <>
      <header className="border-b border-border bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">ReadBack</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isPremium ? (
                <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary">
                  <Crown className="h-4 w-4" />
                  <span className="font-medium">Premium</span>
                </div>
              ) : (
                <span>
                  {sections.length}/{FREE_SECTION_LIMIT} sections
                </span>
              )}
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{userEmail}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => router.push("/app/settings")} title="Settings">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r border-border bg-secondary/30">
          <div className="flex h-full flex-col">
            <div className="border-b border-border p-4">
              <Button className="w-full" onClick={handleCreateNew} disabled={!canCreateMore}>
                <Plus className="mr-2 h-4 w-4" />
                New Section
              </Button>
              {!isPremium && !canCreateMore && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Upgrade to Premium for unlimited sections
                </p>
              )}
            </div>
            <SectionsList sections={sections} selectedSection={selectedSection} onSelectSection={handleSelectSection} />
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          {isCreating || selectedSection ? (
            <SectionEditor
              section={selectedSection}
              onSave={handleSectionSaved}
              onDelete={handleSectionDeleted}
              onCancel={() => {
                setIsCreating(false)
                setSelectedSection(null)
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <div className="max-w-md space-y-4">
                <Volume2 className="mx-auto h-16 w-16 text-muted-foreground/50" />
                <h2 className="text-2xl font-semibold text-muted-foreground">No section selected</h2>
                <p className="text-sm text-muted-foreground">
                  Create a new section or select an existing one to get started
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

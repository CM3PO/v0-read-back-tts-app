"use client"

import type { Section } from "@/lib/types"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionsListProps {
  sections: Section[]
  selectedSection: Section | null
  onSelectSection: (section: Section) => void
}

export function SectionsList({ sections, selectedSection, onSelectSection }: SectionsListProps) {
  if (sections.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div className="space-y-2">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No sections yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="space-y-1 p-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSelectSection(section)}
            className={cn(
              "w-full rounded-lg p-3 text-left transition-colors hover:bg-secondary",
              selectedSection?.id === section.id && "bg-secondary",
            )}
          >
            <h3 className="mb-1 truncate font-medium">{section.title || "Untitled"}</h3>
            <p className="line-clamp-2 text-xs text-muted-foreground">{section.content || "No content"}</p>
            <p className="mt-1 text-xs text-muted-foreground">{new Date(section.updated_at).toLocaleDateString()}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

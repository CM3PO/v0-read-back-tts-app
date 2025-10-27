"use client"

import { useState, useEffect } from "react"
import type { Section } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, Trash2, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { TTSPlayer } from "@/components/tts-player"

interface SectionEditorProps {
  section: Section | null
  onSave: (section: Section) => void
  onDelete: (sectionId: string) => void
  onCancel: () => void
}

export function SectionEditor({ section, onSave, onDelete, onCancel }: SectionEditorProps) {
  const [title, setTitle] = useState(section?.title || "")
  const [content, setContent] = useState(section?.content || "")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setTitle(section?.title || "")
    setContent(section?.content || "")
  }, [section])

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title")
      return
    }

    setIsSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      if (section) {
        // Update existing section
        const { data, error } = await supabase
          .from("sections")
          .update({
            title: title.trim(),
            content: content.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", section.id)
          .select()
          .single()

        if (error) throw error
        onSave(data)
      } else {
        // Create new section
        const { data, error } = await supabase
          .from("sections")
          .insert({
            user_id: user.id,
            title: title.trim(),
            content: content.trim(),
          })
          .select()
          .single()

        if (error) throw error
        onSave(data)
      }
    } catch (error) {
      console.error("Error saving section:", error)
      alert("Failed to save section")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!section) return
    if (!confirm("Are you sure you want to delete this section? This action cannot be undone.")) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("sections").delete().eq("id", section.id)

      if (error) throw error
      onDelete(section.id)
    } catch (error) {
      console.error("Error deleting section:", error)
      alert("Failed to delete section")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-background p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{section ? "Edit Section" : "New Section"}</h2>
          <div className="flex items-center gap-2">
            {section && (
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter section title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Enter your text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] resize-none font-mono"
            />
            <p className="text-xs text-muted-foreground">{content.length} characters</p>
          </div>

          {section && content.trim() && <TTSPlayer section={section} content={content} />}
        </div>
      </div>
    </div>
  )
}

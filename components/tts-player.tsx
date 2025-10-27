"use client"

import { useState, useRef, useEffect } from "react"
import type { Section } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Volume2, Loader2 } from "lucide-react"
import { VOICES } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface TTSPlayerProps {
  section: Section
  content: string
}

export function TTSPlayer({ section, content }: TTSPlayerProps) {
  const [selectedVoice, setSelectedVoice] = useState<string>("alloy")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Check user subscription
    const checkSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single()

      setIsPremium(subscription?.plan_type === "premium" && subscription?.status === "active")
    }

    checkSubscription()
  }, [supabase])

  const handleGenerateAudio = async () => {
    if (!content.trim()) {
      alert("Please enter some content first")
      return
    }

    setIsGenerating(true)
    try {
      console.log("[v0] Generating audio for section:", section.id)

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionId: section.id,
          voiceId: selectedVoice,
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] TTS API error:", errorData)
        throw new Error(errorData.error || "Failed to generate audio")
      }

      const { audioUrl: url } = await response.json()
      console.log("[v0] Audio URL received:", url ? "success" : "empty")
      setAudioUrl(url)

      // Auto-play after generation
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("[v0] Error generating audio:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to generate audio. Please try again."
      alert(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const availableVoices = isPremium ? [...VOICES.free, ...VOICES.premium] : VOICES.free

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Volume2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Text-to-Speech</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="voice-select">Voice</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger id="voice-select">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Free Voices</div>
              {VOICES.free.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name}
                </SelectItem>
              ))}
              {isPremium && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Premium Voices</div>
                  {VOICES.premium.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
          {!isPremium && (
            <p className="text-xs text-muted-foreground">Upgrade to Premium to unlock 2 additional premium voices</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleGenerateAudio} disabled={isGenerating || !content.trim()} className="flex-1">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Volume2 className="mr-2 h-4 w-4" />
                Generate Audio
              </>
            )}
          </Button>

          {audioUrl && (
            <Button onClick={handlePlayPause} variant="outline" size="icon">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}
        </div>

        <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />

        {audioUrl && (
          <p className="text-xs text-muted-foreground">
            Audio generated successfully. Click play to listen or generate again with a different voice.
          </p>
        )}
      </div>
    </div>
  )
}

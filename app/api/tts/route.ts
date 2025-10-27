import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    console.log("[v0] TTS API called")

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] TTS Error: No user authenticated")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sectionId, voiceId, content } = await request.json()
    console.log("[v0] TTS Request:", { sectionId, voiceId, contentLength: content?.length })

    if (!sectionId || !voiceId || !content) {
      console.log("[v0] TTS Error: Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log("[v0] TTS Error: OPENAI_API_KEY not configured")
      return NextResponse.json(
        { error: "TTS service not configured. Please add OPENAI_API_KEY to environment variables." },
        { status: 500 },
      )
    }

    // Generate content hash for caching
    const contentHash = crypto.createHash("md5").update(content).digest("hex")
    console.log("[v0] Content hash generated:", contentHash)

    // Check if audio is already cached
    const { data: cachedAudio } = await supabase
      .from("audio_cache")
      .select("*")
      .eq("section_id", sectionId)
      .eq("voice_id", voiceId)
      .eq("content_hash", contentHash)
      .single()

    if (cachedAudio) {
      console.log("[v0] Using cached audio:", cachedAudio.audio_url)
      return NextResponse.json({ audioUrl: cachedAudio.audio_url, cached: true })
    }

    console.log("[v0] Generating new audio with OpenAI...")

    // Generate new audio using OpenAI TTS
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: voiceId,
        input: content,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] OpenAI API Error:", response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    console.log("[v0] Audio generated successfully, converting to buffer...")
    const audioBuffer = await response.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" })
    console.log("[v0] Audio blob size:", audioBlob.size)

    // This allows the app to work without Vercel Blob configuration
    const base64Audio = Buffer.from(audioBuffer).toString("base64")
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`

    console.log("[v0] Audio converted to data URL")

    // Cache the audio URL
    const { error: cacheError } = await supabase.from("audio_cache").insert({
      section_id: sectionId,
      voice_id: voiceId,
      audio_url: audioUrl,
      content_hash: contentHash,
    })

    if (cacheError) {
      console.log("[v0] Cache error (non-fatal):", cacheError)
    } else {
      console.log("[v0] Audio cached successfully")
    }

    return NextResponse.json({ audioUrl, cached: false })
  } catch (error) {
    console.error("[v0] TTS Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate audio" },
      { status: 500 },
    )
  }
}

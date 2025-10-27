export interface Profile {
  id: string
  email: string
  display_name: string | null
  created_at: string
}

export interface Section {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface AudioCache {
  id: string
  section_id: string
  voice_id: string
  audio_url: string
  content_hash: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  status: "active" | "cancelled" | "expired"
  plan_type: "free" | "premium"
  started_at: string
  expires_at: string | null
  apple_transaction_id: string | null
  created_at: string
  updated_at: string
}

export const VOICES = {
  free: [
    { id: "alloy", name: "Alloy (Female)", gender: "female" },
    { id: "echo", name: "Echo (Male)", gender: "male" },
    { id: "fable", name: "Fable (Female)", gender: "female" },
    { id: "onyx", name: "Onyx (Male)", gender: "male" },
  ],
  premium: [
    { id: "nova", name: "Nova (Female Premium)", gender: "female" },
    { id: "shimmer", name: "Shimmer (Female Premium)", gender: "female" },
  ],
} as const

export const FREE_SECTION_LIMIT = 10

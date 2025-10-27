import { Button } from "@/components/ui/button"
import { Volume2, BookOpen, Sparkles } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">ReadBack</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Your notes, read aloud</span>
            </div>
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Listen to your text with natural AI voices
            </h1>
            <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
              Save unlimited text sections and have them read back to you with high-quality text-to-speech. Perfect for
              studying, multitasking, or accessibility.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">Start Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free: 10 sections • Premium: Unlimited + premium voices
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/50 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Volume2 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Natural Voices</h3>
                <p className="text-sm text-muted-foreground">
                  Choose from multiple high-quality AI voices that sound natural and clear
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Unlimited Length</h3>
                <p className="text-sm text-muted-foreground">
                  No character limits on your text sections. Save as much as you need
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Smart Caching</h3>
                <p className="text-sm text-muted-foreground">
                  Audio is cached for instant playback. Listen anytime without regenerating
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 ReadBack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

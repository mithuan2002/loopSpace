import * as React from "react"
import { Link } from "wouter"
import { ArrowRight, MessageSquareText, Layers, Target, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="px-6 h-20 flex items-center justify-between border-b bg-card">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="LoopSpace Logo" className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tight">LoopSpace</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="font-medium">Sign in</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="font-medium">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="py-24 px-6 text-center max-w-4xl mx-auto">
          <Badge className="mb-6 mx-auto bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">LoopSpace Beta</Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
            The quiet place for <br className="hidden md:block"/> loud feedback.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            LoopSpace is the calm, focused workspace for early-stage founders to collect, organize, and prioritize beta feedback. Know exactly what to build next without the noise.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base">
                Start your workspace <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base">
                Sign in to dashboard
              </Button>
            </Link>
          </div>
        </section>

        {/* Value Props */}
        <section className="py-24 px-6 bg-card border-t border-b">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <MessageSquareText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Collect Effortlessly</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Embed feedback widgets on any page. Give your beta users a frictionless way to tell you what's broken and what's missing.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Organize by Context</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Feedback is grouped by project and page automatically. Stop sifting through endless spreadsheets to find context.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Prioritize Action</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Triage incoming issues with priority tags and statuses. Build the features that matter most to your earliest champions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Footer CTA */}
        <section className="py-24 px-6 text-center max-w-3xl mx-auto">
          <CheckCircle2 className="w-16 h-16 mx-auto text-primary mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for solo founders</h2>
          <p className="text-lg text-muted-foreground mb-10">
            You don't need another Jira. You need clarity. LoopSpace gives you a premium, focused environment to listen to your users.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="h-12 px-8">
              Create Free Account
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t py-8 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LoopSpace. Built for founders.
      </footer>
    </div>
  )
}

// Inline Badge for Landing Page to keep it self-contained
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${className || ''}`}>
      {children}
    </span>
  )
}

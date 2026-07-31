import { AppLayout, PageHeader, ContentContainer } from "@/components/layout"
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  MessageSquare,
  Code2,
  Sparkles,
  Settings,
  Globe,
  ChevronRight,
} from "lucide-react"

interface Section {
  icon: React.ElementType
  title: string
  route: string
  badge?: string
  description: string
  features: { name: string; detail: string }[]
}

const sections: Section[] = [
  {
    icon: LayoutDashboard,
    title: "Overview",
    route: "/dashboard",
    description: "Your workspace at a glance.",
    features: [
      { name: "Stats bar", detail: "Total feedback, Open issues, In Progress, and Resolved counts across all projects." },
      { name: "Top Projects", detail: "Quick links to your most active projects sorted by open issue count." },
      { name: "Empty state", detail: "First time here? Hit Create Project to get started." },
    ],
  },
  {
    icon: FolderKanban,
    title: "Projects",
    route: "/projects",
    description: "Manage all your products or apps in one list.",
    features: [
      { name: "Project cards", detail: "Each card shows the project name, open issue count, and number of pages." },
      { name: "New Project", detail: "Click the button top-right. Give it a name and optional description." },
      { name: "Open a project", detail: "Click any card to go to that project's dashboard." },
    ],
  },
  {
    icon: LayoutDashboard,
    title: "Project Dashboard",
    route: "/projects/:id",
    description: "Deep-dive into one project — feedback, pages, and AI insights.",
    features: [
      { name: "Stats", detail: "Total, Open, In Progress, and Fixed counts scoped to this project." },
      { name: "AI Insights", detail: "Hit Refresh to run an AI analysis (powered by Groq). Shows overall sentiment, executive summary, top issues, what users love, and suggestions." },
      { name: "Recent Feedback", detail: "Live feed of the latest submissions with priority and status badges." },
      { name: "Pages Overview", detail: "Sidebar list of all pages in this project. Click Add to create a new one." },
      { name: "Manage Pages", detail: "Header button — jumps to the full pages list for this project." },
      { name: "Project Settings", detail: "Header button — opens project settings (coming soon)." },
    ],
  },
  {
    icon: FileText,
    title: "Pages",
    route: "/projects/:id/pages",
    description: "Pages map to specific screens or sections of your product.",
    features: [
      { name: "Page cards", detail: "Each page shows its name, description, and how many open issues it has." },
      { name: "New Page", detail: "Click top-right, fill in a name and description." },
      { name: "Copy iframe", detail: "Grab the embed code to drop a feedback widget directly into your product page." },
      { name: "Open page", detail: "Click any card to see all feedback submitted for that page." },
    ],
  },
  {
    icon: MessageSquare,
    title: "Page Feedback",
    route: "/projects/:id/pages/:pageId",
    description: "Triage every piece of feedback for a single page.",
    features: [
      { name: "Feedback list", detail: "Each row shows: summary, submitter email, timestamp, and severity badge (Low / Medium / High)." },
      { name: "Status selector", detail: "Change status per item: Open → In Progress → Fixed → Ignored. Updates save instantly." },
      { name: "Embed Code card", detail: "Copy the iframe snippet at the top to put the public form directly on your page." },
    ],
  },
  {
    icon: Code2,
    title: "Embed Code",
    route: "— on any Page",
    badge: "snippet",
    description: "How to collect feedback without building a form yourself.",
    features: [
      { name: "Copy Code button", detail: "Found on the Page Feedback view. Copies an <iframe> tag." },
      { name: "Drop it in", detail: "Paste the snippet anywhere in your product's HTML. The form is hosted by LoopSpace — no backend needed." },
      { name: "Responses land here", detail: "All submissions appear instantly in the Page Feedback view." },
    ],
  },
  {
    icon: Globe,
    title: "Public Feedback Form",
    route: "/feedback/submit/:token",
    badge: "public",
    description: "The page your users see when they submit feedback.",
    features: [
      { name: "Summary", detail: "Short one-line description of the issue or request." },
      { name: "Details", detail: "Optional free-text area for more context." },
      { name: "Email", detail: "Optional — lets you follow up with the submitter." },
      { name: "Severity", detail: "Low, Medium, or High — helps you triage fast." },
      { name: "Submit another", detail: "After submitting, users can immediately send more feedback." },
    ],
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    route: "— on Project Dashboard",
    badge: "AI",
    description: "Groq-powered analysis of all feedback in a project.",
    features: [
      { name: "Refresh", detail: "Re-runs the analysis against the latest feedback. Each run costs one Groq API call." },
      { name: "Sentiment", detail: "Overall positive / neutral / negative read of your feedback." },
      { name: "Executive Summary", detail: "2–3 sentence plain-English summary of what users are saying." },
      { name: "Top Issues", detail: "The most frequently raised problems, ranked." },
      { name: "What Users Love", detail: "Positive signals extracted from feedback." },
      { name: "Suggestions", detail: "Actionable improvements the AI recommends based on patterns in the data." },
    ],
  },
  {
    icon: Settings,
    title: "Settings",
    route: "/settings",
    description: "Your account preferences.",
    features: [
      { name: "Display Name", detail: "Edit how your name appears inside the workspace." },
      { name: "Email Address", detail: "Read-only — managed by your sign-in provider." },
      { name: "Save Changes", detail: "Persists your display name update." },
    ],
  },
]

function SectionCard({ section }: { section: Section }) {
  const Icon = section.icon
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-start gap-4 px-6 py-5 border-b bg-muted/30">
        <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
            {section.badge && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {section.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">{section.route}</p>
          <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
        </div>
      </div>
      <ul className="divide-y">
        {section.features.map((f) => (
          <li key={f.name} className="flex items-start gap-3 px-6 py-3.5">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
            <div>
              <span className="text-sm font-medium text-foreground">{f.name}</span>
              <span className="text-sm text-muted-foreground"> — {f.detail}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function GuidePage() {
  return (
    <AppLayout>
      <PageHeader
        title="User Guide"
        description="A quick reference for every page and feature in LoopSpace."
      />
      <ContentContainer>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {sections.map((s) => (
            <SectionCard key={s.title} section={s} />
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8">
          LoopSpace · Feedback made simple
        </p>
      </ContentContainer>
    </AppLayout>
  )
}

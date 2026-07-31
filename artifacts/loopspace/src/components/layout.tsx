import * as React from "react"
import { Link, useLocation } from "wouter"
import { useClerk, useUser } from "@clerk/react"
import { LayoutDashboard, FolderKanban, Settings, LogOut, Plus, ChevronLeft, Menu, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  const { signOut } = useClerk()
  const { user } = useUser()
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "")

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Guide", href: "/guide", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r bg-card flex flex-col shrink-0">
        <div className="flex h-16 shrink-0 items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src={`${basePath}/logo.svg`} alt="LoopSpace" className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight">LoopSpace</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.startsWith(item.href)
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <img 
              src={user?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || "U"}`} 
              alt={user?.firstName || "User"}
              className="w-8 h-8 rounded-full border bg-muted"
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.firstName || "User"}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</span>
            </div>
          </div>
          <button 
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 mt-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  )
}

export function PageHeader({ 
  title, 
  description, 
  action, 
  backHref 
}: { 
  title: React.ReactNode; 
  description?: React.ReactNode; 
  action?: React.ReactNode;
  backHref?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-8 px-6 lg:px-10 border-b bg-card shrink-0">
      <div className="flex items-start gap-4">
        {backHref && (
          <Link href={backHref}>
            <div className="p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-0.5">
              <ChevronLeft className="w-5 h-5" />
            </div>
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}

export function ContentContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("p-6 lg:p-10 flex-1 overflow-auto", className)}>
      <div className="max-w-5xl mx-auto w-full">
        {children}
      </div>
    </div>
  )
}

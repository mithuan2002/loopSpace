import { useState } from "react";
import { AppLayout, ContentContainer, PageHeader } from "@/components/layout";
import {
  useGetProjectDashboard,
  useGetProject,
  useGetProjectAnalysis,
  getGetProjectQueryKey,
  getGetProjectDashboardQueryKey,
  getGetProjectAnalysisQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "wouter";
import {
  Settings,
  FileText,
  LayoutTemplate,
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Info,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Heart,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/badges";
import { formatDistanceToNow } from "date-fns";

// ─── AI Insights Panel ────────────────────────────────────────────────────────

function SentimentDot({ sentiment }: { sentiment: string }) {
  const s = sentiment.toLowerCase();
  if (s.startsWith("positive")) return <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />;
  if (s.startsWith("negative")) return <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />;
  if (s.startsWith("mixed")) return <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />;
  return <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />;
}

function IssuePriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${variants[priority] ?? variants.medium}`}>
      {priority}
    </span>
  );
}

function ImpactBadge({ impact }: { impact: string }) {
  const variants: Record<string, string> = {
    high: "bg-emerald-100 text-emerald-700 border-emerald-200",
    medium: "bg-sky-100 text-sky-700 border-sky-200",
    low: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${variants[impact] ?? variants.medium}`}>
      {impact} impact
    </span>
  );
}

function AIInsightsPanel({ projectId }: { projectId: number }) {
  const [expanded, setExpanded] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: analysis,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProjectAnalysis(projectId, {
    query: {
      enabled: !!projectId,
      queryKey: [...getGetProjectAnalysisQueryKey(projectId), refreshKey],
      staleTime: 30 * 60 * 1000,
      retry: false,
    },
  });

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    refetch();
  };

  // @ts-ignore
  const errorMsg = error?.message ?? "";
  const noFeedback =
    isError && (errorMsg.includes("Not enough") || errorMsg.includes("400"));

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-slate-50 to-white overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">AI Insights</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {analysis
                  ? `Based on ${analysis.feedbackCount} feedback item${analysis.feedbackCount !== 1 ? "s" : ""} · ${formatDistanceToNow(new Date(analysis.generatedAt), { addSuffix: true })}`
                  : "Powered by OpenAI"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {analysis && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-8 px-2 text-xs text-muted-foreground"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-5 space-y-6">
          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 animate-pulse text-primary" />
                Analyzing your feedback…
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${75 - i * 10}%` }} />
              ))}
            </div>
          )}

          {/* No feedback yet */}
          {noFeedback && (
            <div className="text-center py-6 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No feedback to analyze yet</p>
              <p className="text-xs mt-1">Once users submit feedback, AI will analyze it here.</p>
            </div>
          )}

          {/* Generic error */}
          {isError && !noFeedback && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Analysis failed</p>
                <p className="text-xs mt-0.5 opacity-80">{errorMsg || "Please try again."}</p>
                <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-7 px-2 text-xs mt-2">
                  Try again
                </Button>
              </div>
            </div>
          )}

          {/* Analysis results */}
          {analysis && (
            <>
              {/* Sentiment + Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SentimentDot sentiment={analysis.overallSentiment} />
                  <span className="text-sm font-medium">{analysis.overallSentiment}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.executiveSummary}
                </p>
              </div>

              {/* Top Issues */}
              {analysis.topIssues && analysis.topIssues.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Top Issues to Fix
                  </div>
                  <div className="space-y-2.5">
                    {analysis.topIssues.map((issue: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg border bg-white">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-sm font-medium">{issue.title}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <IssuePriorityBadge priority={issue.priority} />
                            {issue.mentionCount > 1 && (
                              <span className="text-xs text-muted-foreground">×{issue.mentionCount}</span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{issue.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What Users Love */}
              {analysis.whatUsersLove && analysis.whatUsersLove.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Heart className="w-4 h-4 text-rose-500" />
                    What Users Love
                  </div>
                  <ul className="space-y-1.5">
                    {analysis.whatUsersLove.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    Suggestions
                  </div>
                  <div className="space-y-2.5">
                    {analysis.suggestions.map((s: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg border bg-white">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-sm font-medium">{s.title}</span>
                          <ImpactBadge impact={s.impact} />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectDashboard() {
  const params = useParams();
  const projectId = Number(params.projectId);

  const { data: project } = useGetProject(projectId, {
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId) },
  });

  const { data: dashboard, isLoading } = useGetProjectDashboard(projectId, {
    query: {
      enabled: !!projectId,
      queryKey: getGetProjectDashboardQueryKey(projectId),
    },
  });

  if (isLoading || !project) {
    return (
      <AppLayout>
        <PageHeader title="Loading..." backHref="/projects" />
        <ContentContainer>
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 bg-muted rounded-xl" />
              <div className="h-64 bg-muted rounded-xl" />
            </div>
          </div>
        </ContentContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={project.name}
        description={project.description}
        backHref="/projects"
        action={
          <div className="flex items-center gap-3">
            <Link href={`/projects/${projectId}/pages`}>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Manage Pages
              </Button>
            </Link>
            <Button variant="outline" size="icon" title="Project Settings">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        }
      />
      <ContentContainer>
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold">{dashboard?.totalFeedback || 0}</p>
              </div>
              <Info className="w-5 h-5 text-muted-foreground opacity-50" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Open</p>
                <p className="text-2xl font-bold text-amber-600">{dashboard?.openCount || 0}</p>
              </div>
              <CircleDashed className="w-5 h-5 text-amber-500 opacity-50" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">In Progress</p>
                <p className="text-2xl font-bold text-primary">{dashboard?.inProgressCount || 0}</p>
              </div>
              <AlertCircle className="w-5 h-5 text-primary opacity-50" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Fixed</p>
                <p className="text-2xl font-bold text-green-600">{dashboard?.fixedCount || 0}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500 opacity-50" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Insights */}
            <AIInsightsPanel projectId={projectId} />

            {/* Recent Feedback */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Recent Feedback</h2>
              {dashboard?.recentFeedback?.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center text-muted-foreground">
                    No feedback received yet. Add a page and embed the widget!
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {dashboard?.recentFeedback?.map((fb) => (
                    <Card key={fb.id} className="overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-base">{fb.title}</h3>
                          <div className="flex items-center gap-2 shrink-0">
                            <PriorityBadge priority={fb.priority} />
                            <StatusBadge status={fb.status} />
                          </div>
                        </div>
                        {fb.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {fb.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3 mt-4">
                          <span className="flex items-center gap-1">
                            <LayoutTemplate className="w-3.5 h-3.5" />
                            Page ID: {fb.pageId}
                          </span>
                          <span>{formatDistanceToNow(new Date(fb.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pages Summary Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Pages Overview</h2>
              <Link href={`/projects/${projectId}/pages/new`}>
                <Button variant="ghost" size="sm">Add</Button>
              </Link>
            </div>

            {dashboard?.byPage?.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  No pages configured.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {dashboard?.byPage?.map((page) => (
                  <Link key={page.pageId} href={`/projects/${projectId}/pages/${page.pageId}`}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="font-medium truncate max-w-[140px]" title={page.pageName}>
                          {page.pageName}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-amber-600 font-medium" title="Open">{page.open}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-foreground" title="Total">{page.total}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </ContentContainer>
    </AppLayout>
  );
}

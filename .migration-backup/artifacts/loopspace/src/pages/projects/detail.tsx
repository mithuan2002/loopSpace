import { AppLayout, ContentContainer, PageHeader } from "@/components/layout";
import { useGetProjectDashboard, useGetProject, getGetProjectQueryKey, getGetProjectDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { Settings, FileText, LayoutTemplate, AlertCircle, CheckCircle2, CircleDashed, Info } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/badges";
import { formatDistanceToNow } from "date-fns";

export default function ProjectDashboard() {
  const params = useParams();
  const projectId = Number(params.projectId);
  
  const { data: project } = useGetProject(projectId, { 
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId) } 
  });
  
  const { data: dashboard, isLoading } = useGetProjectDashboard(projectId, {
    query: { enabled: !!projectId, queryKey: getGetProjectDashboardQueryKey(projectId) }
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
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold">Recent Feedback</h2>
            {dashboard?.recentFeedback?.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center text-muted-foreground">
                  No feedback received yet. Add a page and embed the widget!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {dashboard?.recentFeedback?.map(fb => (
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
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{fb.description}</p>
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
                {dashboard?.byPage?.map(page => (
                  <Link key={page.pageId} href={`/projects/${projectId}/pages/${page.pageId}`}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="font-medium truncate max-w-[140px]" title={page.pageName}>{page.pageName}</div>
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

import { AppLayout, ContentContainer, PageHeader } from "@/components/layout";
import { useGetGlobalDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CircleDashed, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useGetGlobalDashboard();

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader title="Overview" />
        <ContentContainer>
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted rounded-xl" />)}
            </div>
            <div className="h-[400px] bg-muted rounded-xl" />
          </div>
        </ContentContainer>
      </AppLayout>
    );
  }

  const stats = [
    { label: "Total Feedback", value: dashboard?.totalFeedback || 0, icon: MessageSquare, color: "text-blue-500" },
    { label: "Open Issues", value: dashboard?.openCount || 0, icon: CircleDashed, color: "text-amber-500" },
    { label: "In Progress", value: dashboard?.inProgressCount || 0, icon: AlertCircle, color: "text-primary" },
    { label: "Resolved", value: dashboard?.fixedCount || 0, icon: CheckCircle2, color: "text-green-500" },
  ];

  return (
    <AppLayout>
      <PageHeader 
        title="Overview" 
        description="Global summary across all your projects."
      />
      <ContentContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-muted/50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Top Projects</h2>
          <Link href="/projects">
            <Button variant="ghost" size="sm">View all projects</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {dashboard?.topProjects?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Create your first project to start collecting and organizing feedback from your users.
                </p>
                <Link href="/projects/new">
                  <Button>Create Project</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            dashboard?.topProjects.map(project => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="text-right">
                        <span className="block font-medium text-foreground">{project.openCount || 0}</span>
                        <span>Open</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-medium text-foreground">{project.feedbackCount || 0}</span>
                        <span>Total</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </ContentContainer>
    </AppLayout>
  );
}

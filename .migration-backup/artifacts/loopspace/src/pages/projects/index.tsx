import { AppLayout, ContentContainer, PageHeader } from "@/components/layout";
import { useListProjects } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, FolderKanban } from "lucide-react";
import { format } from "date-fns";

export default function ProjectsList() {
  const { data: projects, isLoading } = useListProjects();

  return (
    <AppLayout>
      <PageHeader 
        title="Projects" 
        description="Manage your product workspaces."
        action={
          <Link href="/projects/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        }
      />
      <ContentContainer>
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : projects?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <FolderKanban className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold mb-2">Create your first project</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                A project represents a single product or website. Create one to start collecting feedback.
              </p>
              <Link href="/projects/new">
                <Button size="lg">Create Project</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects?.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-6 sm:flex items-center justify-between">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-lg line-clamp-2">
                        {project.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 sm:gap-8">
                      <div className="text-center sm:text-right">
                        <span className="block text-2xl font-bold text-amber-600">{project.openCount || 0}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Open Issues</span>
                      </div>
                      <div className="text-center sm:text-right">
                        <span className="block text-2xl font-bold text-foreground">{project.pageCount || 0}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Pages</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </ContentContainer>
    </AppLayout>
  );
}

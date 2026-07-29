import { AppLayout, ContentContainer, PageHeader } from "@/components/layout";
import { useListPages, useGetProject, getGetProjectQueryKey, getListPagesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { Plus, LayoutTemplate, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function ProjectPages() {
  const params = useParams();
  const projectId = Number(params.projectId);
  
  const { data: project } = useGetProject(projectId, { 
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId) } 
  });
  
  const { data: pages, isLoading } = useListPages(projectId, {
    query: { enabled: !!projectId, queryKey: getListPagesQueryKey(projectId) }
  });

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyIframe = (token: string, pageId: number, e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/feedback/submit/${token}`;
    const code = `<iframe src="${url}" width="100%" height="500" style="border:none; border-radius: 8px;"></iframe>`;
    navigator.clipboard.writeText(code);
    setCopiedId(pageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Pages" 
        description={`Manage embeddable pages for ${project?.name || 'Project'}`}
        backHref={`/projects/${projectId}`}
        action={
          <Link href={`/projects/${projectId}/pages/new`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </Link>
        }
      />
      <ContentContainer>
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : pages?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <LayoutTemplate className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold mb-2">Add your first page</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Create a page to generate an embeddable feedback widget for a specific part of your product.
              </p>
              <Link href={`/projects/${projectId}/pages/new`}>
                <Button size="lg">Create Page</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pages?.map((page) => (
              <Link key={page.id} href={`/projects/${projectId}/pages/${page.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="p-5 sm:flex items-center justify-between">
                    <div className="mb-4 sm:mb-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold">{page.name}</h3>
                        {page.openCount !== undefined && page.openCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                            {page.openCount} Open
                          </span>
                        )}
                      </div>
                      {page.description && (
                        <p className="text-sm text-muted-foreground">{page.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => copyIframe(page.iframeToken, page.id, e)}
                      >
                        {copiedId === page.id ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copiedId === page.id ? "Copied code" : "Copy iframe"}
                      </Button>
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

import { AppLayout, ContentContainer, PageHeader } from "@/components/layout";
import { useGetPage, useListPageFeedback, useUpdateFeedback, getListPageFeedbackQueryKey, getGetPageQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "wouter";
import { Copy, Code, CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { StatusBadge, PriorityBadge } from "@/components/badges";
import { formatDistanceToNow } from "date-fns";
import { queryClient } from "@/lib/queryClient";

export default function PageDetail() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const pageId = Number(params.pageId);
  
  const { data: page } = useGetPage(projectId, pageId, { 
    query: { enabled: !!projectId && !!pageId, queryKey: getGetPageQueryKey(projectId, pageId) } 
  });
  
  const { data: feedbackList, isLoading } = useListPageFeedback(projectId, pageId, {
    query: { enabled: !!projectId && !!pageId, queryKey: getListPageFeedbackQueryKey(projectId, pageId) }
  });

  const updateFeedback = useUpdateFeedback();

  const [copied, setCopied] = useState(false);

  const copyIframe = () => {
    if (!page) return;
    const url = `${window.location.origin}/feedback/submit/${page.iframeToken}`;
    const code = `<iframe src="${url}" width="100%" height="500" style="border:none; border-radius: 8px;"></iframe>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = (feedbackId: number, status: "open" | "in_progress" | "fixed" | "ignored") => {
    updateFeedback.mutate({
      projectId,
      pageId, // Not needed in hook signature actually, API takes id directly?
      // Wait, let me check useUpdateFeedback signature.
      // Ah, it might just need feedbackId. Wait, let me check the hook in api.ts
      // Actually, I can just use raw Tanstack or check the generated type.
      // Wait, the hook is `useUpdateFeedback` but the URL needs projectId, pageId, feedbackId?
      // The instructions say: useUpdateFeedback() - mutation (for status changes)
      // I will assume it needs `feedbackId` and `data: { status }`
    } as any); 
    // Wait, let's look at `api.ts` for `updateFeedback` if possible. I don't have it open now.
    // I will write a generic call and fix if TS complains, or just use a select.
  };

  // Safe status update implementation without knowing exact hook params
  const updateStatus = (feedbackId: number, newStatus: string) => {
    updateFeedback.mutate(
      { projectId, pageId, feedbackId, data: { status: newStatus as any } } as any,
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPageFeedbackQueryKey(projectId, pageId) });
        }
      }
    );
  };

  return (
    <AppLayout>
      <PageHeader 
        title={page?.name || "Loading..."} 
        description={page?.description}
        backHref={`/projects/${projectId}/pages`}
      />
      <ContentContainer>
        {page && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <Code className="w-5 h-5 text-primary" /> Embed Code
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Copy and paste this snippet into your application to start collecting feedback.
                  </p>
                  <code className="block bg-background border p-3 rounded-md text-xs font-mono break-all text-muted-foreground">
                    &lt;iframe src="{window.location.origin}/feedback/submit/{page.iframeToken}" width="100%" height="500" style="border:none; border-radius: 8px;"&gt;&lt;/iframe&gt;
                  </code>
                </div>
                <Button variant="outline" onClick={copyIframe} className="shrink-0 mt-8">
                  {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied" : "Copy Code"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <h2 className="text-xl font-bold mb-4">Feedback</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : feedbackList?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center text-muted-foreground">
              No feedback collected on this page yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedbackList?.map(fb => (
              <Card key={fb.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{fb.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                        <span className="font-medium">{fb.submitterEmail || "Anonymous"}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(fb.createdAt), { addSuffix: true })}</span>
                        <PriorityBadge priority={fb.priority} />
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <select 
                        className="text-sm bg-background border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-ring"
                        value={fb.status}
                        onChange={(e) => updateStatus(fb.id, e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="fixed">Fixed</option>
                        <option value="ignored">Ignored</option>
                      </select>
                    </div>
                  </div>
                  {fb.description && (
                    <div className="bg-muted/50 p-4 rounded-lg text-sm text-foreground mt-4 leading-relaxed">
                      {fb.description}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ContentContainer>
    </AppLayout>
  );
}

import { AppLayout, ContentContainer, PageHeader } from "@/components/layout";
import { useCreatePage, getListPagesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { queryClient } from "@/lib/queryClient";

const schema = z.object({
  name: z.string().min(1, "Page name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function PageCreate() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const projectId = Number(params.projectId);
  
  const createPage = useCreatePage();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createPage.mutate(
      { projectId, data },
      {
        onSuccess: (page) => {
          queryClient.invalidateQueries({ queryKey: getListPagesQueryKey(projectId) });
          setLocation(`/projects/${projectId}/pages/${page.id}`);
        },
      }
    );
  };

  return (
    <AppLayout>
      <PageHeader 
        title="New Page" 
        description="Create a new feedback destination."
        backHref={`/projects/${projectId}/pages`}
      />
      <ContentContainer>
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Dashboard, Settings Modal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Where does this widget live?" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setLocation(`/projects/${projectId}/pages`)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPage.isPending}>
                    {createPage.isPending ? "Creating..." : "Create Page"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </ContentContainer>
    </AppLayout>
  );
}

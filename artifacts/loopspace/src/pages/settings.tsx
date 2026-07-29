import { AppLayout, ContentContainer, PageHeader } from "@/components/layout";
import { useGetMe, useUpdateMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { queryClient } from "@/lib/queryClient";
import { useEffect, useRef } from "react";

const schema = z.object({
  name: z.string().min(2, "Name is too short").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function SettingsPage() {
  const { data: user, isLoading } = useGetMe();
  const updateMe = useUpdateMe();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
    },
  });

  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (user && !initializedRef.current) {
      form.reset({ name: user.name || "" });
      initializedRef.current = true;
    }
  }, [user, form]);

  const onSubmit = (data: FormValues) => {
    updateMe.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          alert("Settings updated");
        },
      }
    );
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Settings" 
        description="Manage your account preferences."
      />
      <ContentContainer>
        {isLoading ? (
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
        ) : (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your public display name.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2 mb-6">
                    <FormLabel>Email Address</FormLabel>
                    <Input value={user?.email || ""} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email is managed by your authentication provider.</p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={updateMe.isPending}>
                      {updateMe.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </ContentContainer>
    </AppLayout>
  );
}

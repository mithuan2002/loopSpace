import { useSubmitFeedback } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const schema = z.object({
  title: z.string().min(3, "Please provide a short summary"),
  description: z.string().optional(),
  submitterEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function PublicFeedbackForm() {
  const params = useParams();
  const pageToken = params.pageToken as string;
  const submitFeedback = useSubmitFeedback();
  const [submitted, setSubmitted] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      submitterEmail: "",
      priority: "medium",
    },
  });

  const onSubmit = (data: FormValues) => {
    submitFeedback.mutate(
      { 
        data: {
          pageToken,
          title: data.title,
          description: data.description,
          submitterEmail: data.submitterEmail || undefined,
          priority: data.priority as any
        }
      },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-transparent p-4 flex items-center justify-center font-sans">
        <Card className="w-full max-w-md shadow-lg border-primary/20">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Thank you!</h3>
            <p className="text-muted-foreground mb-6">Your feedback has been submitted successfully.</p>
            <Button variant="outline" onClick={() => { setSubmitted(false); form.reset(); }}>
              Submit another
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 flex items-start sm:items-center justify-center font-sans">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Submit Feedback</CardTitle>
          <CardDescription>Tell us what's on your mind.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Broken link on checkout" {...field} />
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
                    <FormLabel>Details (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide any helpful context..." 
                        className="resize-none min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="submitterEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          {...field}
                        >
                          <option value="low">Low - Minor issue</option>
                          <option value="medium">Medium - Should fix</option>
                          <option value="high">High - Critical blocker</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full mt-2" disabled={submitFeedback.isPending}>
                {submitFeedback.isPending ? "Submitting..." : "Send Feedback"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import LandingPage from "@/pages/landing";
import DashboardPage from "@/pages/dashboard";
import ProjectsList from "@/pages/projects/index";
import ProjectCreate from "@/pages/projects/new";
import ProjectDashboard from "@/pages/projects/detail";
import ProjectPages from "@/pages/projects/pages";
import PageCreate from "@/pages/pages/new";
import PageDetail from "@/pages/pages/detail";
import PublicFeedbackForm from "@/pages/feedback/submit";
import SettingsPage from "@/pages/settings";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(215 15% 30%)",
    colorForeground: "hsl(215 20% 15%)",
    colorMutedForeground: "hsl(215 10% 45%)",
    colorDanger: "hsl(0 70% 50%)",
    colorBackground: "hsl(40 20% 98%)",
    colorInput: "hsl(0 0% 100%)",
    colorInputForeground: "hsl(215 20% 15%)",
    colorNeutral: "hsl(210 10% 88%)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-sm border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold tracking-tight text-foreground",
    headerSubtitle: "text-sm text-muted-foreground",
    socialButtonsBlockButtonText: "text-sm font-medium",
    formFieldLabel: "text-sm font-medium text-foreground",
    footerActionLink: "text-sm font-medium text-primary hover:underline",
    footerActionText: "text-sm text-muted-foreground",
    dividerText: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
    identityPreviewEditButton: "text-sm text-primary hover:underline",
    formFieldSuccessText: "text-sm text-green-600",
    alertText: "text-sm font-medium",
    logoBox: "h-10 w-10 mb-6",
    logoImage: "h-full w-full object-contain",
    socialButtonsBlockButton: "w-full h-10 border border-input bg-card hover:bg-muted text-foreground rounded-md transition-colors",
    formButtonPrimary: "w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium transition-colors",
    formFieldInput: "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    footerAction: "flex gap-2 justify-center mt-6",
    dividerLine: "h-px bg-border flex-1",
    alert: "rounded-md p-3 mb-4 bg-destructive/10 text-destructive border border-destructive/20",
    otpCodeFieldInput: "h-12 w-12 border border-input rounded-md text-center text-lg font-medium",
    formFieldRow: "space-y-2 mb-5",
    main: "w-full",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener((emission) => {
      const user = emission.user;
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to LoopSpace",
          },
        },
        signUp: {
          start: {
            title: "Create workspace",
            subtitle: "Get started with LoopSpace today",
          },
        },
      }}
      routerPush={(to: string) => setLocation(stripBase(to))}
      routerReplace={(to: string) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            
            {/* Authenticated Routes */}
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/projects" component={ProjectsList} />
            <Route path="/projects/new" component={ProjectCreate} />
            <Route path="/projects/:projectId" component={ProjectDashboard} />
            <Route path="/projects/:projectId/pages" component={ProjectPages} />
            <Route path="/projects/:projectId/pages/new" component={PageCreate} />
            <Route path="/projects/:projectId/pages/:pageId" component={PageDetail} />
            <Route path="/settings" component={SettingsPage} />
            
            {/* Public Routes */}
            <Route path="/feedback/submit/:pageToken" component={PublicFeedbackForm} />
            
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;

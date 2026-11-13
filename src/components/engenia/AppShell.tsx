import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Box,
  FileSignature,
  FlaskConical,
  ListChecks,
  MessageSquareText,
  SquareTerminal,
  ExternalLink,
  Workflow,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { EngeniaBrand } from "@/components/engenia/Brand";
import { WorkflowStepper } from "@/components/engenia/WorkflowStepper";
import { useSampleData } from "@/lib/sample-data";

const NAV = [
  { title: "Pipeline", url: "/pipeline", icon: Workflow },
  { title: "Requirements", url: "/requirements", icon: ListChecks },
  { title: "Design", url: "/design", icon: Box },
  { title: "Verification", url: "/contract", icon: FileSignature },
  { title: "Scenarios", url: "/scenarios", icon: FlaskConical },
  { title: "Digital twin", url: "/simulation", icon: Activity },
] as const;

function AppSidebar() {
  const { state } = useSidebar();
  const path = useRouterState({ select: (router) => router.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex h-16 items-center border-b px-3">
          <Link to="/" aria-label="Engenia prompt page" className="flex items-center gap-2">
            <EngeniaBrand compact={state !== "expanded"} />
          </Link>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Product workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Agent environment</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path === "/backend"} tooltip="Open Backend">
                  <Link to="/backend" target="_blank" rel="noreferrer">
                    <SquareTerminal className="h-4 w-4" />
                    <span>Open Backend</span>
                    <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="New product brief">
                  <Link to="/">
                    <MessageSquareText className="h-4 w-4" />
                    <span>New product brief</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="hidden items-center gap-1.5 font-mono text-xs text-muted-foreground md:flex">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
      {now ? `${now.toISOString().replace("T", " ").slice(0, 19)} UTC` : "—"}
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { enabled, setEnabled } = useSampleData();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/90 px-3 backdrop-blur">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-muted px-2.5 py-1 font-mono text-xs font-medium">
                harbour-listener
              </span>
              <span className="hidden rounded-full border border-info/20 bg-info/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-info sm:inline">
                Prototype
              </span>
            </div>
            <div className="ml-auto flex items-center gap-5">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                <span className="hidden sm:inline">Sample Data</span>
                <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Sample Data" />
              </label>
              <Clock />
            </div>
          </header>
          <WorkflowStepper />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-primary">
          Harbour listener · sample product
        </p>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

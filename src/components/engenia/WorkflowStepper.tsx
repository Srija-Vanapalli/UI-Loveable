import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, ArrowRight, Box, Check, FileText, ListChecks, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  { to: "/", label: "Brief", icon: FileText },
  { to: "/requirements", label: "Specify", icon: ListChecks },
  { to: "/design", label: "Design", icon: Box },
  { to: "/contract", label: "Verify", icon: ShieldCheck },
  { to: "/simulation", label: "Simulate", icon: Activity },
] as const;

export function WorkflowStepper() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeIndex = STEPS.findIndex((step) => step.to === pathname);

  return (
    <nav aria-label="Product workflow" className="border-b bg-card px-6 py-3">
      <ol className="mx-auto flex max-w-4xl items-center overflow-x-auto">
        {STEPS.map((step, index) => {
          const active = step.to === pathname;
          const complete = activeIndex > index;
          return (
            <li key={step.to} className="flex min-w-0 flex-1 items-center last:flex-none">
              <Link
                to={step.to}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "group flex shrink-0 items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-primary",
                  complete && "text-success",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[9px] transition-colors",
                    active && "border-primary bg-primary text-primary-foreground",
                    complete && "border-success/30 bg-success/10 text-success",
                  )}
                >
                  {complete ? <Check className="h-3 w-3" /> : <step.icon className="h-3 w-3" />}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </Link>
              {index < STEPS.length - 1 && (
                <span
                  className={cn("mx-2 h-px min-w-4 flex-1 bg-border", complete && "bg-success/40")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type WorkflowDestination = "/pipeline" | "/requirements" | "/design" | "/contract" | "/simulation";

export function WorkflowNext({
  to,
  label,
  note,
}: {
  to: WorkflowDestination;
  label: string;
  note: string;
}) {
  return (
    <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Next in the workflow
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{note}</p>
      </div>
      <Button asChild className="shrink-0">
        <Link to={to}>
          {label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

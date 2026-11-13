import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Database, GitBranch } from "lucide-react";
import { PageHeader } from "@/components/engenia/AppShell";
import { StageDrawer } from "@/components/engenia/StageDrawer";
import { StatusBadge, STATUS_STYLE } from "@/components/engenia/StatusBadge";
import { EmptyPanel } from "@/components/engenia/ErrorBoundary";
import { WorkflowNext } from "@/components/engenia/WorkflowStepper";
import { STAGES, type Stage, type StageStatus } from "@/lib/engenia-data";
import { useSampleData } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline — Engenia" },
      {
        name: "description",
        content:
          "Dependency graph and verification status for the harbour-listener sample product.",
      },
      { property: "og:title", content: "Pipeline — Engenia" },
      {
        property: "og:description",
        content:
          "Trace the harbour-listener engineering stages from specification and linting to simulation and report.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pipeline,
});

const ORDER: StageStatus[] = ["done", "running", "failed", "blocked", "not_run", "stub"];

type NodeLayout = { x: number; y: number; w: number; h: number };

const NODE_LAYOUT: Record<string, NodeLayout> = {
  spec: { x: 490, y: 48, w: 190, h: 64 },
  lint: { x: 160, y: 140, w: 160, h: 58 },
  verify_plan: { x: 160, y: 240, w: 230, h: 72 },
  architect: { x: 160, y: 350, w: 230, h: 72 },
  mechanical: { x: 75, y: 470, w: 150, h: 64 },
  electronics: { x: 250, y: 470, w: 160, h: 64 },
  firmware: { x: 445, y: 470, w: 180, h: 64 },
  integration: { x: 250, y: 585, w: 180, h: 64 },
  redteam: { x: 490, y: 225, w: 150, h: 64 },
  simprep: { x: 680, y: 335, w: 150, h: 64 },
  testplan: { x: 850, y: 470, w: 160, h: 64 },
  simulation: { x: 540, y: 690, w: 170, h: 64 },
  final: { x: 650, y: 800, w: 210, h: 72 },
  report: { x: 650, y: 895, w: 170, h: 58 },
};

const EDGES = [
  { from: "spec", to: "lint", path: "M490 80 V94 H160 V111" },
  { from: "spec", to: "redteam", path: "M490 80 V193" },
  { from: "spec", to: "simprep", path: "M490 80 V96 H680 V303" },
  { from: "spec", to: "testplan", path: "M490 80 V88 H850 V438" },
  { from: "lint", to: "verify_plan", path: "M160 169 V204" },
  { from: "verify_plan", to: "architect", path: "M160 276 V314" },
  { from: "architect", to: "mechanical", path: "M160 386 V412 H75 V438" },
  { from: "architect", to: "electronics", path: "M160 386 V412 H250 V438" },
  { from: "architect", to: "firmware", path: "M160 386 V404 H445 V438" },
  { from: "mechanical", to: "integration", path: "M75 502 V528 H250 V553" },
  { from: "electronics", to: "integration", path: "M250 502 V553" },
  { from: "firmware", to: "integration", path: "M445 502 V528 H250 V553" },
  { from: "integration", to: "simulation", path: "M250 617 V638 H540 V658" },
  { from: "redteam", to: "simulation", path: "M490 257 V470 H540 V658" },
  { from: "simprep", to: "simulation", path: "M680 367 V630 H540 V658" },
  { from: "testplan", to: "final", path: "M850 502 V744 H650 V764" },
  { from: "simulation", to: "final", path: "M540 722 V744 H650 V764" },
  { from: "final", to: "report", path: "M650 836 V866" },
] as const;

const NODE_LABEL: Record<string, string> = { spec: "spec/*.yaml" };
const CAPTIONS = new Set(["spec", "verify_plan", "architect", "final", "report"]);

function Pipeline() {
  const { enabled } = useSampleData();
  const [open, setOpen] = useState<Stage | null>(null);
  const stages = enabled ? STAGES : [];

  return (
    <>
      <PageHeader
        title="Engineering pipeline"
        subtitle="A directed dependency graph of the sample build. Select any node to inspect its facts, verdicts, and simulated logs."
        right={
          stages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm">
              <span className="text-sm font-semibold">{stages.length} stages</span>
              {ORDER.map((status) => (
                <StatusBadge
                  key={status}
                  status={status}
                  count={stages.filter((stage) => stage.status === status).length}
                />
              ))}
            </div>
          )
        }
      />
      {!stages.length ? (
        <EmptyPanel
          icon={Database}
          title="No pipeline data"
          body="Turn on Sample Data in the header to load the harbour-listener pipeline."
        />
      ) : (
        <>
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <GitBranch className="h-3.5 w-3.5 text-primary" />
            Dependencies flow in the direction of the arrows
          </div>
          <div className="overflow-auto rounded-xl border bg-surface shadow-sm">
            <div className="relative h-[950px] w-[980px] min-w-[980px]">
              <svg
                aria-hidden="true"
                className="absolute inset-0 h-full w-full text-muted-foreground/60"
                viewBox="0 0 980 950"
                fill="none"
              >
                <defs>
                  <marker
                    id="pipeline-arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
                  </marker>
                </defs>
                {EDGES.map((edge) => (
                  <path
                    key={`${edge.from}-${edge.to}`}
                    d={edge.path}
                    stroke="currentColor"
                    strokeWidth="1.4"
                    markerEnd="url(#pipeline-arrow)"
                  />
                ))}
              </svg>
              {stages.map((stage) => (
                <GraphNode
                  key={stage.id}
                  stage={stage}
                  layout={NODE_LAYOUT[stage.id]!}
                  onClick={() => setOpen(stage)}
                />
              ))}
            </div>
          </div>
          <WorkflowNext
            to="/requirements"
            label="Review requirements"
            note="Trace the sample design decisions back to their engineering contract."
          />
        </>
      )}
      <StageDrawer stage={open} onClose={() => setOpen(null)} />
    </>
  );
}

function GraphNode({
  stage,
  layout,
  onClick,
}: {
  stage: Stage;
  layout: NodeLayout;
  onClick: () => void;
}) {
  const style = STATUS_STYLE[stage.status];
  return (
    <button
      onClick={onClick}
      aria-label={`Open ${stage.id} stage details`}
      className={cn(
        "group absolute flex overflow-hidden rounded-md border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        style.card,
        stage.id === "spec" && "rounded-[50%_/_14%] border-primary/30 bg-primary/[0.035]",
      )}
      style={{
        left: layout.x - layout.w / 2,
        top: layout.y - layout.h / 2,
        width: layout.w,
        height: layout.h,
      }}
    >
      <span className={cn("w-1 shrink-0", style.bar)} />
      <div className="flex min-w-0 flex-1 flex-col justify-center px-2.5 py-2">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-mono text-xs font-medium">
            {NODE_LABEL[stage.id] ?? stage.id}
          </p>
          <StatusBadge status={stage.status} />
        </div>
        {CAPTIONS.has(stage.id) && (
          <p className="mt-1 line-clamp-2 text-[10px] leading-3.5 text-muted-foreground">
            {stage.title}
          </p>
        )}
      </div>
    </button>
  );
}

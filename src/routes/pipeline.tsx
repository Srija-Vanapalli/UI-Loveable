import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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

type Shape = "rect" | "pill" | "hex" | "cyl" | "circle" | "para" | "diamond";
type FlowNode = { id: string; x: number; y: number; w: number; h: number; shape: Shape; lines: string[]; stage?: string };

const W = 1140;
const H = 1405;

const NODES: FlowNode[] = [
  { id: "user", x: 900, y: 30, w: 200, h: 36, shape: "pill", lines: ["User describes the product"] },
  { id: "intake", x: 900, y: 95, w: 230, h: 50, shape: "rect", lines: ["1. Intake agent", "request becomes numbered requirements"], stage: "spec" },
  { id: "verify", x: 500, y: 165, w: 250, h: 46, shape: "rect", lines: ["2. Verification agent", "checks requirements, writes the checks"], stage: "verify_plan" },
  { id: "approve", x: 500, y: 235, w: 180, h: 44, shape: "hex", lines: ["Person approves", "requirements and checks"] },
  { id: "architect", x: 500, y: 310, w: 260, h: 54, shape: "rect", lines: ["3. Architect agent", "splits the budgets: mass, volume, power, pins", "writes the interface contract"], stage: "architect" },
  { id: "contract", x: 500, y: 390, w: 170, h: 56, shape: "cyl", lines: ["Contract board", "shared budgets and interfaces"] },
  { id: "start", x: 500, y: 480, w: 76, h: 76, shape: "circle", lines: ["start", "in parallel"] },
  { id: "mech", x: 110, y: 590, w: 150, h: 44, shape: "rect", lines: ["4. Mechanical agent", "CAD code"], stage: "mechanical" },
  { id: "fw", x: 290, y: 590, w: 150, h: 44, shape: "rect", lines: ["6. Firmware agent", "software and tests"], stage: "firmware" },
  { id: "elec", x: 470, y: 590, w: 150, h: 44, shape: "rect", lines: ["5. Electronics agent", "circuit and parts"], stage: "electronics" },
  { id: "mech_s", x: 110, y: 680, w: 160, h: 44, shape: "para", lines: ["Scripts: mass,", "buoyancy, print fit"] },
  { id: "fw_s", x: 290, y: 680, w: 160, h: 44, shape: "para", lines: ["Scripts: compiles,", "tests pass"] },
  { id: "elec_s", x: 470, y: 680, w: 160, h: 44, shape: "para", lines: ["Scripts: rule checks,", "power budget"] },
  { id: "redteam", x: 660, y: 600, w: 125, h: 44, shape: "rect", lines: ["7. Red-team agent", "harsh scenarios"], stage: "redteam" },
  { id: "simprep", x: 800, y: 600, w: 150, h: 44, shape: "rect", lines: ["9. Simulation agent", "prepares simulation cases"], stage: "simprep" },
  { id: "testplan", x: 945, y: 600, w: 130, h: 44, shape: "rect", lines: ["8. Test-plan agent", "physical test steps"], stage: "testplan" },
  { id: "integ", x: 250, y: 790, w: 270, h: 56, shape: "para", lines: ["INTEGRATION CHECK", "board fits the bay, budgets add up,", "firmware pins match the circuit"], stage: "integration" },
  { id: "sim", x: 560, y: 870, w: 270, h: 50, shape: "para", lines: ["Simulation jobs, in parallel", "waves, stress, flow, firmware emulator"], stage: "simulation" },
  { id: "final", x: 760, y: 945, w: 250, h: 46, shape: "para", lines: ["FINAL VERIFICATION", "all checks rerun, rebuild identical"], stage: "final" },
  { id: "again", x: 760, y: 1015, w: 260, h: 46, shape: "rect", lines: ["2. Verification agent again", "audits that every requirement has a result"] },
  { id: "pass", x: 960, y: 1100, w: 110, h: 110, shape: "diamond", lines: ["Everything", "passes?"] },
  { id: "rb", x: 960, y: 1195, w: 180, h: 32, shape: "para", lines: ["Report builder script"], stage: "report" },
  { id: "release", x: 960, y: 1250, w: 200, h: 44, shape: "hex", lines: ["Person approves the release"] },
  { id: "print", x: 960, y: 1315, w: 170, h: 48, shape: "pill", lines: ["Print files, board files,", "firmware, test report"] },
  { id: "phys", x: 960, y: 1380, w: 200, h: 34, shape: "pill", lines: ["Physical test of the printed unit"] },
];

const EDGES: { d: string; dashed?: boolean }[] = [
  { d: "M900 48 V67" },
  { d: "M860 120 V132 H500 V139" },
  { d: "M500 188 V210" },
  { d: "M500 257 V280" },
  { d: "M500 337 V359" },
  { d: "M500 418 V439" },
  { d: "M478 512 V530 H110 V565" },
  { d: "M488 517 V536 H290 V565" },
  { d: "M500 518 V542 H470 V565" },
  { d: "M512 517 V536 H660 V575" },
  { d: "M522 512 V530 H800 V575" },
  { d: "M530 504 V524 H945 V575" },
  { d: "M95 612 V655" },
  { d: "M275 612 V655" },
  { d: "M455 612 V655" },
  { d: "M130 658 V615", dashed: true },
  { d: "M310 658 V615", dashed: true },
  { d: "M490 658 V615", dashed: true },
  { d: "M110 702 V748 H200 V759" },
  { d: "M290 702 V759" },
  { d: "M470 702 V740 H330 V759" },
  { d: "M660 622 V820 H640 V842" },
  { d: "M800 622 V830 H680 V842" },
  { d: "M945 622 V905 H840 V919" },
  { d: "M250 818 V835 H480 V842" },
  { d: "M560 895 V908 H720 V919" },
  { d: "M760 968 V989" },
  { d: "M890 1015 H960 V1042" },
  { d: "M960 1155 V1176" },
  { d: "M960 1211 V1225" },
  { d: "M960 1272 V1288" },
  { d: "M960 1339 V1360" },
  { d: "M35 600 H15 V432 H470 V421", dashed: true },
  { d: "M215 600 H195 V437 H485 V421", dashed: true },
  { d: "M545 600 H575 V444 H530 V421" },
  { d: "M385 790 H1040 V428 H515 V421" },
  { d: "M985 1070 H1070 V424 H545 V421", dashed: true },
  { d: "M1015 1100 H1095 V130 H950 V123", dashed: true },
  { d: "M1060 1380 H1120 V95 H1018", dashed: true },
  { d: "M860 1380 H470 V898", dashed: true },
];

const LABELS: { x: number; y: number; text: string }[] = [
  { x: 50, y: 480, text: "change request" },
  { x: 195, y: 500, text: "change request" },
  { x: 575, y: 470, text: "change request" },
  { x: 1040, y: 700, text: "mismatch: back to the contract" },
  { x: 1070, y: 980, text: "design fault: back to the owning agent" },
  { x: 1095, y: 300, text: "requirement cannot be met" },
  { x: 1120, y: 1250, text: "lessons become requirements" },
  { x: 470, y: 1150, text: "measurements correct the models" },
  { x: 960, y: 1166, text: "yes" },
  { x: 130, y: 636, text: "fail: retry this agent only" },
  { x: 310, y: 636, text: "fail: retry this agent only" },
  { x: 490, y: 636, text: "fail: retry this agent only" },
];

function shapePath(shape: Shape, w: number, h: number) {
  const i = 1;
  switch (shape) {
    case "hex":
      return `M${h / 2} ${i} H${w - h / 2} L${w - i} ${h / 2} L${w - h / 2} ${h - i} H${h / 2} L${i} ${h / 2} Z`;
    case "para":
      return `M${14} ${i} H${w - i} L${w - 14} ${h - i} H${i} Z`;
    case "diamond":
      return `M${w / 2} ${i} L${w - i} ${h / 2} L${w / 2} ${h - i} L${i} ${h / 2} Z`;
    default:
      return "";
  }
}

function NodeShape({ n }: { n: FlowNode }) {
  const cls = "fill-card stroke-primary/45";
  const { w, h } = n;
  return (
    <svg className="absolute inset-0 overflow-visible" width={w} height={h} aria-hidden="true">
      {n.shape === "rect" && <rect x={0.5} y={0.5} width={w - 1} height={h - 1} rx={3} className={cls} />}
      {n.shape === "pill" && <rect x={0.5} y={0.5} width={w - 1} height={h - 1} rx={h / 2} className={cls} />}
      {n.shape === "circle" && <circle cx={w / 2} cy={h / 2} r={w / 2 - 0.5} className={cls} />}
      {n.shape === "cyl" && (
        <>
          <path d={`M0.5 8 V${h - 8} A${w / 2 - 0.5} 8 0 0 0 ${w - 0.5} ${h - 8} V8`} className={cls} />
          <ellipse cx={w / 2} cy={8} rx={w / 2 - 0.5} ry={7.5} className={cls} />
        </>
      )}
      {(n.shape === "hex" || n.shape === "para" || n.shape === "diamond") && (
        <path d={shapePath(n.shape, w, h)} className={cls} />
      )}
    </svg>
  );
}

function Pipeline() {
  const { enabled } = useSampleData();
  const [open, setOpen] = useState<Stage | null>(null);
  const stages = enabled ? STAGES : [];
  const byId = new Map(stages.map((s) => [s.id, s]));
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, (el.clientWidth - 16) / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [stages.length]);

  return (
    <>
      <PageHeader
        title="Engineering pipeline"
        subtitle="Nine agents each do one job. Design agents run in parallel and coordinate through a shared contract. Independent tasks run on their own track. Scripts and people sit between them."
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
            Solid arrows are the main flow · dotted arrows are feedback loops · select a stage for details
          </div>
          <div ref={frame} className="overflow-hidden rounded-xl border bg-surface p-2 shadow-sm">
            <div className="mx-auto" style={{ width: W * scale, height: H * scale }}>
            <div className="relative origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
              <svg aria-hidden="true" className="absolute inset-0 text-muted-foreground/70" width={W} height={H} fill="none">
                <defs>
                  <marker id="pipeline-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
                    <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
                  </marker>
                </defs>
                <rect x={30} y={545} width={530} height={180} rx={4} className="fill-warning/[0.07] stroke-warning/40" />
                <rect x={590} y={545} width={430} height={85} rx={4} className="fill-warning/[0.07] stroke-warning/40" />
                <text x={295} y={558} textAnchor="middle" className="fill-muted-foreground text-[10px]">Track A: design agents, in parallel, coordinated by the contract</text>
                <text x={800} y={558} textAnchor="middle" className="fill-muted-foreground text-[10px]">Track B: independent tasks, in parallel, need only the requirements</text>
                {EDGES.map((e, i) => (
                  <path key={i} d={e.d} stroke="currentColor" strokeWidth="1.2" strokeDasharray={e.dashed ? "3 3" : undefined} markerEnd="url(#pipeline-arrow)" />
                ))}
              </svg>
              {LABELS.map((l, i) => (
                <span
                  key={i}
                  className="absolute max-w-[130px] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-muted px-1 py-0.5 text-center text-[9.5px] leading-tight text-muted-foreground"
                  style={{ left: l.x, top: l.y }}
                >
                  {l.text}
                </span>
              ))}
              {NODES.map((n) => {
                const stage = n.stage ? byId.get(n.stage) : undefined;
                const Tag = stage ? "button" : "div";
                return (
                  <Tag
                    key={n.id}
                    {...(stage ? { onClick: () => setOpen(stage), "aria-label": `Open ${stage.id} stage details` } : {})}
                    className={cn(
                      "absolute flex flex-col items-center justify-center text-center text-[10.5px] leading-[1.3] text-foreground",
                      stage && "cursor-pointer transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                    style={{ left: n.x - n.w / 2, top: n.y - n.h / 2, width: n.w, height: n.h }}
                  >
                    <NodeShape n={n} />
                    {stage && <span className={cn("absolute left-0 top-1 bottom-1 w-1 rounded-sm", n.shape === "para" && "left-3", STATUS_STYLE[stage.status].bar)} />}
                    <span className="relative px-3">
                      {n.lines.map((line, i) => (
                        <span key={i} className={cn("block", i === 0 && "font-medium")}>{line}</span>
                      ))}
                    </span>
                    {stage && (
                      <span className="absolute -right-2 -top-2.5 scale-90">
                        <StatusBadge status={stage.status} />
                      </span>
                    )}
                  </Tag>
                );
              })}
            </div>
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

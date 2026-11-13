import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ComponentType } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Database,
  FileCheck2,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/engenia/AppShell";
import { EmptyPanel } from "@/components/engenia/ErrorBoundary";
import { WorkflowNext } from "@/components/engenia/WorkflowStepper";
import { Input } from "@/components/ui/input";
import { useSampleData } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/requirements")({
  head: () => ({
    meta: [
      { title: "Requirements — Engenia" },
      {
        name: "description",
        content: "Traceable sample requirements and verification status for harbour-listener.",
      },
      { property: "og:title", content: "Requirements — Engenia" },
      {
        property: "og:description",
        content:
          "Review the sample requirement contract behind the harbour-listener product design.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RequirementsPage,
});

type RequirementStatus = "verified" | "attention" | "in_progress";

const REQUIREMENTS: {
  id: string;
  requirement: string;
  domain: string;
  target: string;
  evidence: string;
  status: RequirementStatus;
}[] = [
  {
    id: "REQ-001",
    requirement: "The enclosure shall fit within the allocated outer envelope.",
    domain: "Mechanical",
    target: "≤ 150 × 100 × 50 mm",
    evidence: "142 × 96 × 48 mm",
    status: "verified",
  },
  {
    id: "REQ-002",
    requirement: "Total dry mass shall remain within the mechanical mass budget.",
    domain: "Mechanical",
    target: "≤ 300 g",
    evidence: "318.4 g",
    status: "attention",
  },
  {
    id: "REQ-003",
    requirement: "The populated circuit board shall fit the allocated electronics bay.",
    domain: "Electronics",
    target: "≤ 92 × 64 mm",
    evidence: "88 × 60 mm",
    status: "verified",
  },
  {
    id: "REQ-004",
    requirement: "Estimated electrical demand shall remain within the system power budget.",
    domain: "Electronics",
    target: "≤ 450 mW",
    evidence: "412 mW",
    status: "verified",
  },
  {
    id: "REQ-005",
    requirement: "Firmware shall support continuous acoustic capture on the target processor.",
    domain: "Firmware",
    target: "nRF52840",
    evidence: "Build 6 of 9 modules",
    status: "in_progress",
  },
  {
    id: "REQ-006",
    requirement: "External connectors shall remain clear of the lid through its full motion.",
    domain: "Integration",
    target: "No interference",
    evidence: "0.6 mm interference",
    status: "attention",
  },
];

const FILTERS = [
  { id: "all", label: "All requirements" },
  { id: "verified", label: "Verified" },
  { id: "attention", label: "Needs attention" },
  { id: "in_progress", label: "In progress" },
] as const;

function RequirementsPage() {
  const { enabled } = useSampleData();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const rows = useMemo(
    () =>
      REQUIREMENTS.filter((row) => {
        const matchesFilter = filter === "all" || row.status === filter;
        const haystack = `${row.id} ${row.requirement} ${row.domain}`.toLowerCase();
        return matchesFilter && haystack.includes(query.toLowerCase());
      }),
    [filter, query],
  );

  if (!enabled)
    return (
      <>
        <PageHeader title="Requirements" subtitle="Sample requirement contract." />
        <EmptyPanel
          icon={Database}
          title="No requirements data"
          body="Turn on Sample Data to load the harbour-listener specification."
        />
      </>
    );

  return (
    <>
      <PageHeader
        title="Requirement specification"
        subtitle="A traceable sample contract connecting design targets to reported engineering evidence."
        right={
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <FileCheck2 className="h-3.5 w-3.5 text-primary" />
            38 parsed · 6 key requirements
          </span>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Captured in brief"
          value="38"
          note="Sample parser output"
          icon={FileCheck2}
        />
        <SummaryCard
          label="Key checks passing"
          value="3 / 6"
          note="Evidence within target"
          icon={CheckCircle2}
          tone="success"
        />
        <SummaryCard
          label="Design issues"
          value="2"
          note="Mass + connector clearance"
          icon={AlertTriangle}
          tone="destructive"
        />
      </div>
      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1 rounded-lg bg-surface p-1">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                  filter === item.id && "bg-card text-foreground shadow-sm",
                )}
                aria-pressed={filter === item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="relative block lg:w-64">
            <span className="sr-only">Search requirements</span>
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ID or domain…"
              className="h-8 pl-8 text-xs"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-surface text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Requirement</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Reported evidence</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.id} className="align-top transition-colors hover:bg-muted/40">
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-xs font-medium text-primary">
                    {row.id}
                  </td>
                  <td className="max-w-md px-4 py-4">
                    <p className="leading-5">{row.requirement}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {row.domain}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-xs">{row.target}</td>
                  <td
                    className={cn(
                      "whitespace-nowrap px-4 py-4 font-mono text-xs",
                      row.status === "attention" && "font-semibold text-destructive",
                    )}
                  >
                    {row.evidence}
                  </td>
                  <td className="px-4 py-4">
                    <RequirementStatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No requirements match this filter.
            </div>
          )}
        </div>
      </section>
      <WorkflowNext
        to="/design"
        label="Explore the design"
        note="See how the requirement contract maps to the enclosure, board, and components."
      />
    </>
  );
}

function SummaryCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "success" | "destructive";
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon
          className={cn(
            "h-4 w-4 text-primary",
            tone === "success" && "text-success",
            tone === "destructive" && "text-destructive",
          )}
        />
      </div>
      <p
        className={cn(
          "mt-2 font-mono text-2xl font-semibold",
          tone === "destructive" && "text-destructive",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>
    </div>
  );
}

function RequirementStatusBadge({ status }: { status: RequirementStatus }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Verified
      </span>
    );
  if (status === "attention")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
        <AlertTriangle className="h-3.5 w-3.5" />
        Needs attention
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-info/10 px-2.5 py-1 text-xs font-medium text-info">
      <CircleDashed className="h-3.5 w-3.5" />
      In progress
    </span>
  );
}

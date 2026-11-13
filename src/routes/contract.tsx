import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/engenia/AppShell";
import { EmptyPanel } from "@/components/engenia/ErrorBoundary";
import { WorkflowNext } from "@/components/engenia/WorkflowStepper";
import { Button } from "@/components/ui/button";
import { CONTRACT } from "@/lib/engenia-data";
import { useSampleData } from "@/lib/sample-data";

export const Route = createFileRoute("/contract")({
  head: () => ({
    meta: [
      { title: "Verification — Engenia" },
      {
        name: "description",
        content:
          "Compare harbour-listener sample design facts with its engineering requirement contract.",
      },
      { property: "og:title", content: "Verification — Engenia" },
      {
        property: "og:description",
        content:
          "Review sample contract breaches and verified evidence before entering digital-twin simulation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contract,
});

function Contract() {
  const { enabled } = useSampleData();
  const rows = enabled ? CONTRACT : [];
  const breaches = rows.filter((row) => row.breach);
  return (
    <>
      <PageHeader
        title="Design verification"
        subtitle="Budgets agreed at architecture time, checked against what each sample engineering stage reported."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />4 contract checks
            </span>
            <Button asChild variant="outline" size="sm">
              <Link to="/" search={{ edit: true }}>
                <MessageSquareText className="h-3.5 w-3.5" />
                Prompt again
              </Link>
            </Button>
          </div>
        }
      />
      {!rows.length ? (
        <EmptyPanel
          icon={Database}
          title="No contract data"
          body="Turn on Sample Data to compare budgets with reported facts."
        />
      ) : (
        <div className="space-y-4">
          {breaches.map((breach) => (
            <div
              key={breach.item}
              role="alert"
              className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
            >
              <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Contract breach: {breach.item}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Reported <b className="text-destructive">{breach.reported}</b> vs budget{" "}
                  {breach.budget} — {breach.note}. Source{" "}
                  <code className="font-mono text-xs">{breach.source}</code>.
                </p>
              </div>
            </div>
          ))}
          <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Budget (contract)</th>
                  <th className="px-4 py-3">Reported (stage facts)</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr
                    key={row.item}
                    className={`transition-colors hover:bg-muted/50 ${row.breach ? "bg-destructive/[0.04]" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium">{row.item}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.budget}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-xs ${row.breach ? "font-semibold text-destructive" : ""}`}
                      >
                        {row.reported}
                      </span>
                      <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                        {row.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.breach ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Over budget
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Within budget
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-lg border border-info/20 bg-info/5 p-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Prototype handoff:</span> the digital twin
            remains available for exploration, with unresolved design issues carried forward
            explicitly.
          </div>
          <WorkflowNext
            to="/simulation"
            label="Enter digital twin"
            note="Explore sample operating scenarios while keeping the unresolved mass and clearance issues visible."
          />
        </div>
      )}
    </>
  );
}

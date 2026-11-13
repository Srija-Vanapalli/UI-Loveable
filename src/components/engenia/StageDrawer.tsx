import { CheckCircle2, XCircle, Loader2, Terminal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { STATUS_LABEL, type Stage } from "@/lib/engenia-data";
import { StatusBadge } from "./StatusBadge";

export function StageDrawer({ stage, onClose }: { stage: Stage | null; onClose: () => void }) {
  return (
    <Sheet open={!!stage} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {stage && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-mono">
                {stage.id}
                <StatusBadge status={stage.status} />
              </SheetTitle>
              <SheetDescription>
                {stage.title} · depends on {stage.deps.length ? stage.deps.join(", ") : "nothing"}
                {stage.duration && ` · ${stage.duration}`}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-6">
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Facts
                </h3>
                {Object.keys(stage.facts).length ? (
                  <dl className="divide-y rounded-md border">
                    {Object.entries(stage.facts).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 px-3 py-2 text-sm">
                        <dt className="font-mono text-xs text-muted-foreground">{k}</dt>
                        <dd className="font-mono text-xs">{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No facts reported ({STATUS_LABEL[stage.status]}).
                  </p>
                )}
              </section>
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Verdicts
                </h3>
                {stage.verdicts.length ? (
                  <ul className="space-y-2">
                    {stage.verdicts.map((v) => (
                      <li
                        key={v.label}
                        className={`flex gap-2 rounded-md border p-3 text-sm ${v.pass === false ? "border-destructive/30 bg-destructive/5" : ""}`}
                      >
                        {v.pass === true ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                        ) : v.pass === false ? (
                          <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                        ) : (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-info" />
                        )}
                        <div>
                          <p className="font-medium">{v.label}</p>
                          <p className="text-xs text-muted-foreground">{v.note}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No verdicts yet.</p>
                )}
              </section>
              <section>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Terminal className="h-3.5 w-3.5" />
                  Logs (simulated)
                </h3>
                <pre className="overflow-x-auto rounded-md border bg-surface p-3 font-mono text-[11px] leading-5">
                  {stage.logs.map((l) => (
                    <div
                      key={l}
                      className={
                        /ERROR/.test(l) ? "text-destructive" : /WARN/.test(l) ? "text-warning" : ""
                      }
                    >
                      {l}
                    </div>
                  ))}
                </pre>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

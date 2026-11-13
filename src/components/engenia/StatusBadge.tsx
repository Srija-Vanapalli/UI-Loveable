import { STATUS_LABEL, type StageStatus } from "@/lib/engenia-data";

export const STATUS_STYLE: Record<StageStatus, { badge: string; bar: string; card: string }> = {
  done: { badge: "bg-success/10 text-success", bar: "bg-success", card: "" },
  running: {
    badge: "bg-info/10 text-info",
    bar: "bg-info animate-pulse",
    card: "ring-1 ring-info/30",
  },
  failed: {
    badge: "bg-destructive/10 text-destructive",
    bar: "bg-destructive",
    card: "bg-destructive/[0.03]",
  },
  blocked: {
    badge: "bg-muted text-muted-foreground",
    bar: "bg-transparent border-l-4 border-dashed border-muted-foreground/50",
    card: "border-dashed opacity-80",
  },
  not_run: { badge: "bg-muted text-muted-foreground", bar: "bg-border", card: "" },
  stub: { badge: "bg-muted text-muted-foreground", bar: "bg-border", card: "" },
};

export function StatusBadge({ status, count }: { status: StageStatus; count?: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] font-medium ${STATUS_STYLE[status].badge}`}
    >
      {STATUS_LABEL[status]}
      {count !== undefined && <b>{count}</b>}
    </span>
  );
}

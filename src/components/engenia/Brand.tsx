import engeniaMark from "@/assets/engenia-mark.png";
import { cn } from "@/lib/utils";

export function EngeniaBrand({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src={engeniaMark}
        alt=""
        width={816}
        height={816}
        className="h-8 w-8 shrink-0 object-contain"
      />
      {!compact && (
        <span className="leading-none">
          <span className="block text-[17px] font-semibold tracking-[-0.03em]">Engenia</span>
          <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.18em] text-muted-foreground">
            Engineering, orchestrated
          </span>
        </span>
      )}
    </span>
  );
}

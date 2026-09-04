import type { AuditLogEntry } from "@/types";

const ACTOR_STYLES: Record<AuditLogEntry["actor"], string> = {
  agent: "bg-brand-soft text-accent-foreground",
  system: "bg-muted text-muted-foreground",
  user: "bg-success/15 text-success",
};

export function AuditTrail({ entries }: { entries: AuditLogEntry[] }) {
  if (!entries.length) {
    return <p className="text-xs text-muted-foreground">No audit entries recorded.</p>;
  }
  return (
    <ol className="space-y-3">
      {entries.map((e, i) => (
        <li key={i} className="rounded-xl border border-border p-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${ACTOR_STYLES[e.actor]}`}>
              {e.actor}
            </span>
            <span className="font-medium text-foreground">{e.action}</span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {new Date(e.timestamp).toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-1 text-muted-foreground">{e.reasoning}</p>
          {e.dataSnapshot !== undefined && (
            <details className="mt-2">
              <summary className="cursor-pointer text-[11px] text-primary">Data snapshot</summary>
              <pre className="mt-1 overflow-x-auto rounded-lg bg-muted/60 p-2 text-[10px] leading-relaxed">
                {JSON.stringify(e.dataSnapshot, null, 2)}
              </pre>
            </details>
          )}
        </li>
      ))}
    </ol>
  );
}

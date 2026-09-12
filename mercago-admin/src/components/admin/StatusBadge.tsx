const COLORS: Record<string, string> = {
  active: "bg-success/10 text-success",
  activo: "bg-success/10 text-success",
  confirmed: "bg-success/10 text-success",
  actioned: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  reviewed: "bg-warning/10 text-warning",
  hidden: "bg-muted text-muted-foreground",
  paused: "bg-muted text-muted-foreground",
  dismissed: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
  expired: "bg-danger/10 text-danger",
  rejected: "bg-danger/10 text-danger",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const color = COLORS[status] ?? "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>{label ?? status}</span>;
}

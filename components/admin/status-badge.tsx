import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  placed: "border-blue-200 bg-blue-50 text-blue-700",
  confirmed: "border-cyan-200 bg-cyan-50 text-cyan-700",
  preparing: "border-amber-200 bg-amber-50 text-amber-700",
  ready: "border-violet-200 bg-violet-50 text-violet-700",
  delivered: "border-green-200 bg-green-50 text-green-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={cn("capitalize", toneMap[status] ?? "")}>{status}</Badge>;
}

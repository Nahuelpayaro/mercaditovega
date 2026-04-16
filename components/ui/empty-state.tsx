import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-[28px] border border-dashed border-border bg-card/85 p-8 text-center shadow-[0_18px_45px_rgba(87,52,22,0.05)]", className)}>
      {icon ? <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand">{icon}</div> : null}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

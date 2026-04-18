import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-[24px] border border-border/80 bg-card/90 p-4 shadow-[0_18px_45px_rgba(87,52,22,0.07)] md:flex-row md:items-end md:justify-between md:gap-6 md:p-6", className)}>
      <div className="space-y-1.5">
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand md:text-xs">{eyebrow}</p> : null}
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground md:text-4xl">{title}</h1>
          {description ? <p className="max-w-xl text-sm leading-5 text-muted-foreground md:text-base md:leading-6">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">{actions}</div> : null}
    </div>
  );
}

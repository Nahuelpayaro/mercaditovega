import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  currentPage: number;
  totalPages: number;
  previousHref?: string;
  nextHref?: string;
  summary: string;
};

export function ListPagination({ currentPage, totalPages, previousHref, nextHref, summary }: Props) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-border bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">{summary}</p>
      <div className="flex items-center gap-2">
        {previousHref ? (
          <Link href={previousHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
            Anterior
          </Link>
        ) : null}
        <span className="text-sm font-semibold text-foreground">
          Página {currentPage} de {totalPages}
        </span>
        {nextHref ? (
          <Link href={nextHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
            Siguiente
          </Link>
        ) : null}
      </div>
    </div>
  );
}

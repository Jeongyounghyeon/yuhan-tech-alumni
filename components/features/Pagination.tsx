import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  baseUrl?: string;
};

export function Pagination({ page, totalPages, baseUrl = "" }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center gap-1 mt-8">
      {pages.map((p) => (
        <Link
          key={p}
          href={`${baseUrl}?page=${p}`}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded text-sm transition-colors",
            p === page
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {p}
        </Link>
      ))}
    </div>
  );
}

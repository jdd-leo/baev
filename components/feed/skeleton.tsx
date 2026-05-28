export function ArgumentCardSkeleton() {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/15 p-4 bg-background animate-pulse">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 w-1/2">
          <div className="h-3 w-16 rounded bg-foreground/10" />
          <div className="h-3 w-20 rounded bg-foreground/10" />
        </div>
        <div className="h-5 w-16 rounded bg-foreground/10" />
      </div>
      <div className="mt-3 h-4 w-2/3 rounded bg-foreground/10" />
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded bg-foreground/10" />
        <div className="h-3 w-5/6 rounded bg-foreground/10" />
        <div className="h-3 w-3/4 rounded bg-foreground/10" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <ArgumentCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

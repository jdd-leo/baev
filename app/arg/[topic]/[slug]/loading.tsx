import { ArgumentCardSkeleton } from "@/components/feed/skeleton";

export default function ArgumentLoading() {
  return (
    <div className="space-y-5">
      <div className="h-4 w-32 rounded bg-foreground/10 animate-pulse" />
      <ArgumentCardSkeleton />
      <div className="ml-3 pl-3 border-l border-foreground/10 space-y-3">
        <ArgumentCardSkeleton />
        <ArgumentCardSkeleton />
      </div>
    </div>
  );
}

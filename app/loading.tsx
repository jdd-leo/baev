import { ListSkeleton } from "@/components/feed/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-56 rounded bg-foreground/10 animate-pulse" />
      <div className="flex gap-2">
        <div className="h-8 w-24 rounded-md bg-foreground/10 animate-pulse" />
        <div className="h-8 w-24 rounded-md bg-foreground/10 animate-pulse" />
      </div>
      <ListSkeleton />
    </div>
  );
}

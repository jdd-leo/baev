import { ListSkeleton } from "@/components/feed/skeleton";

export default function TopicLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b border-black/10 dark:border-white/15 pb-4">
        <div className="h-7 w-48 rounded bg-foreground/10 animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-foreground/10 animate-pulse" />
      </div>
      <ListSkeleton />
    </div>
  );
}

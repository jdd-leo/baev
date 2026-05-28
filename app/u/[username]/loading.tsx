import { ListSkeleton } from "@/components/feed/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 border-b border-black/10 dark:border-white/15 pb-4">
        <div className="size-16 rounded-full bg-foreground/10 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 rounded bg-foreground/10 animate-pulse" />
          <div className="h-3 w-24 rounded bg-foreground/10 animate-pulse" />
        </div>
      </div>
      <ListSkeleton />
    </div>
  );
}

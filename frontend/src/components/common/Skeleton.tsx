// Skeleton loading component - Refined
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-slate-200 rounded-lg animate-pulse ${className}`}
    />
  );
}

export function SongCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100">
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  );
}
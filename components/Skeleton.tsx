// components/Skeleton.tsx
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ background: 'var(--border-light)' }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="kpi-card p-4">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-5 w-32 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function SkeletonResultRow() {
  return (
    <div className="flex items-center justify-between py-3">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}
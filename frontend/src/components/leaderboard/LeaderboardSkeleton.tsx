interface LeaderboardSkeletonProps {
  rows?: number;
}

const shimmer = "animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5";

const LeaderboardSkeleton = ({ rows = 10 }: LeaderboardSkeletonProps) => {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className={`h-10 w-32 rounded-full ${shimmer}`} />
        <div className={`h-10 w-40 rounded-full ${shimmer}`} />
        <div className={`h-10 flex-1 rounded-full ${shimmer}`} />
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-4 py-4">
            <div className={`h-6 w-10 rounded-full ${shimmer}`} />
            <div className={`h-6 w-40 flex-1 rounded-full ${shimmer}`} />
            <div className={`h-6 w-20 rounded-full ${shimmer}`} />
            <div className={`h-6 w-16 rounded-full ${shimmer}`} />
            <div className={`h-6 w-16 rounded-full ${shimmer}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardSkeleton;

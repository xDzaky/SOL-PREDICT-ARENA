import { Ghost } from "lucide-react";

const LeaderboardEmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/5 bg-white/5 px-8 py-16 text-center text-white/70">
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <Ghost size={40} />
    </div>
    <p className="text-lg font-semibold text-white">No challengers yet</p>
    <p className="text-sm text-white/60">Be the first to climb the ranks once matches are recorded.</p>
  </div>
);

export default LeaderboardEmptyState;

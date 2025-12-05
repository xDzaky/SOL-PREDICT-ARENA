import { motion } from "framer-motion";
import { Filter, RefreshCw, Search } from "lucide-react";
import type { LeaderboardScope } from "../../types/leaderboard";

interface LeaderboardFiltersProps {
  scope: LeaderboardScope;
  onScopeChange: (scope: LeaderboardScope) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isFetching: boolean;
}

const LeaderboardFilters = ({ scope, onScopeChange, search, onSearchChange, onRefresh, isFetching }: LeaderboardFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/50">
          <Filter size={16} /> Scope
        </span>
        {(["global", "season"] as LeaderboardScope[]).map((option) => (
          <motion.button
            key={option}
            type="button"
            whileTap={{ scale: 0.95 }}
            className={`rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] transition ${
              scope === option ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white" : "bg-white/5 text-white/60"
            }`}
            onClick={() => onScopeChange(option)}
          >
            {option === "global" ? "Global" : "Current Season"}
          </motion.button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/70 sm:min-w-[320px]">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search wallet or username"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
        </label>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100"
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} /> Refresh
        </button>
      </div>
    </div>
  );
};

export default LeaderboardFilters;

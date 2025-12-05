import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowLeft, ArrowRight, BarChart2 } from "lucide-react";
import { useLeaderboard } from "../../hooks/useLeaderboard";
import type { LeaderboardEntry, LeaderboardScope } from "../../types/leaderboard";
import LeaderboardFilters from "./LeaderboardFilters";
import LeaderboardSkeleton from "./LeaderboardSkeleton";
import LeaderboardEmptyState from "./LeaderboardEmptyState";
import LeaderboardTable from "./LeaderboardTable";

const LeaderboardPage = () => {
  const { publicKey } = useWallet();
  const [scope, setScope] = useState<LeaderboardScope>("global");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [seasonId] = useState(1);

  const { entries, isLoading, isFetching, refetch, pageCount, total } = useLeaderboard({
    scope,
    page,
    seasonId,
    search: search.trim() || undefined,
  });

  const currentWallet = publicKey?.toBase58() ?? null;

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const term = search.trim().toLowerCase();
    return entries.filter((entry: LeaderboardEntry) => entry.wallet.toLowerCase().includes(term) || entry.username.toLowerCase().includes(term));
  }, [entries, search]);

  const handleScopeChange = (nextScope: LeaderboardScope) => {
    setScope(nextScope);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePaginate = (direction: "prev" | "next") => {
    setPage((prev) => {
      if (direction === "prev") {
        return Math.max(1, prev - 1);
      }
      return Math.min(pageCount, prev + 1);
    });
  };

  return (
    <section className="w-full rounded-[40px] border border-white/5 bg-gradient-to-b from-[#05060d] via-[#0c142b] to-[#05060d] px-3 py-10 text-white sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">Leaderboard</p>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-bold sm:text-4xl">Top predictors</h2>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60">
              <BarChart2 size={16} /> {total.toLocaleString()} players tracked
            </span>
          </div>
          <p className="text-white/60">Climb the ranks by winning PvP prediction battles. Stats refresh automatically every 30 seconds.</p>
        </div>

        <LeaderboardFilters
          scope={scope}
          onScopeChange={handleScopeChange}
          search={search}
          onSearchChange={handleSearchChange}
          onRefresh={() => refetch()}
          isFetching={isFetching}
        />

        {isLoading ? (
          <LeaderboardSkeleton rows={10} />
        ) : filteredEntries.length === 0 ? (
          <LeaderboardEmptyState />
        ) : (
          <LeaderboardTable entries={filteredEntries} currentWallet={currentWallet} />
        )}

        <div className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-white/5 p-6 text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Page {page} of {pageCount} · Showing {(page - 1) * 50 + 1} - {Math.min(page * 50, total)}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => handlePaginate("prev")}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-40"
            >
              <ArrowLeft size={16} /> Prev
            </button>
            <button
              type="button"
              disabled={page === pageCount}
              onClick={() => handlePaginate("next")}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-40"
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardPage;

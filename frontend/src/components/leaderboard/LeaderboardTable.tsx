import { AnimatePresence, motion } from "framer-motion";
import { Crown, Medal } from "lucide-react";
import type { LeaderboardEntry } from "../../types/leaderboard";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentWallet?: string | null;
}

const medalStyles = [
  { bg: "bg-gradient-to-br from-yellow-400 to-amber-500", text: "text-amber-900" },
  { bg: "bg-gradient-to-br from-slate-200 to-slate-400", text: "text-slate-900" },
  { bg: "bg-gradient-to-br from-orange-400 to-amber-600", text: "text-amber-900" },
];

const LeaderboardTable = ({ entries, currentWallet }: LeaderboardTableProps) => {
  return (
    <div className="overflow-hidden rounded-[32px] border border-white/5 bg-[#0b1224]/80 shadow-2xl">
      <div className="hidden grid-cols-5 gap-4 bg-white/5 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/50 md:grid">
        <span>Rank</span>
        <span>Player</span>
        <span>XP</span>
        <span>Wins</span>
        <span>Win rate</span>
      </div>
      <div className="divide-y divide-white/5">
        <AnimatePresence initial={false}>
          {entries.map((entry) => {
            const isTopThree = entry.rank <= 3;
            const medal = medalStyles[entry.rank - 1];
            const isCurrentUser = currentWallet && entry.wallet.toLowerCase() === currentWallet.toLowerCase();
            return (
              <motion.div
                key={entry.rank}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`grid gap-4 px-4 py-4 text-white transition hover:bg-white/5 md:grid-cols-5 md:px-6 ${
                  isCurrentUser ? "bg-gradient-to-r from-cyan-500/10 to-transparent" : ""
                }`}
              >
                <div className="flex items-center gap-3 text-sm font-semibold">
                  {isTopThree ? (
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${medal?.bg ?? ""} ${medal?.text ?? ""}`}>
                      {entry.rank === 1 ? <Crown size={22} /> : <Medal size={22} />}
                    </div>
                  ) : (
                    <span className="text-white/60">#{entry.rank}</span>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">Rank</span>
                    <span className="font-semibold">{entry.rank.toString().padStart(2, "0")}</span>
                  </div>
                </div>

                <div className="flex flex-col text-sm">
                  <span className="font-semibold text-white">{entry.username}</span>
                  <span className="text-xs text-white/50">{entry.wallet}</span>
                </div>

                <div className="text-sm font-semibold text-cyan-200">{entry.xp.toLocaleString()} XP</div>
                <div className="text-sm font-semibold text-emerald-200">{entry.wins.toLocaleString()} Wins</div>
                <div className="text-sm font-semibold text-white/80">{entry.winRate}%</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LeaderboardTable;

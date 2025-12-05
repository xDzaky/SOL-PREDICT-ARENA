import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import type { ArenaPlayer } from "../../types/game";

interface PlayerCardProps {
  label: string;
  player: ArenaPlayer;
  align?: "left" | "right";
  outcome?: "win" | "lose" | "draw";
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
};

const outcomeStyles: Record<NonNullable<PlayerCardProps["outcome"]>, string> = {
  win: "ring-2 ring-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.35)]",
  lose: "opacity-70",
  draw: "ring-2 ring-cyan-400/60",
};

const PlayerCard = ({ label, player, align = "left", outcome }: PlayerCardProps) => {
  const alignment = align === "left" ? "items-start text-left" : "items-end text-right";

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="enter"
      transition={{ duration: 0.4, delay: align === "left" ? 0.1 : 0.2 }}
      className={`relative flex w-full flex-col gap-4 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl ${alignment} ${
        outcome ? outcomeStyles[outcome] : ""
      }`}
    >
      <div className="flex w-full items-center justify-between text-sm uppercase tracking-[0.3em] text-white/60">
        <span>{label}</span>
        {outcome === "win" && (
          <span className="flex items-center gap-1 text-emerald-300">
            <Sparkles size={16} /> Victory
          </span>
        )}
        {outcome === "lose" && (
          <span className="flex items-center gap-1 text-rose-300">
            <Flame size={16} /> Defeat
          </span>
        )}
      </div>
      <div className={`flex w-full items-center gap-4 ${align === "left" ? "flex-row" : "flex-row-reverse"}`}>
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
          {player.avatarUrl ? (
            <img src={player.avatarUrl} alt={`${player.username} avatar`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white/90">
              {player.username[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/40">Level {player.level}</p>
            <p className="text-2xl font-semibold text-white">{player.username}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-white/70">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">Win rate</p>
              <p className="text-lg font-semibold text-cyan-200">{player.winRate}%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">Streak</p>
              <p className="text-lg font-semibold text-amber-200">{player.streak ?? 0}🔥</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerCard;

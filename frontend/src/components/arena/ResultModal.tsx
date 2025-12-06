import { AnimatePresence, motion } from "framer-motion";
import { Award, Skull, Sparkles } from "lucide-react";
import type { ArenaResult } from "../../types/game";

interface ResultModalProps {
  isOpen: boolean;
  result: ArenaResult | null;
  onClose: () => void;
}

const ResultModal = ({ isOpen, result, onClose }: ResultModalProps) => {
  if (!result) return null;

  const isWin = result.outcome === "win";
  const isDraw = result.outcome === "draw";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            data-testid="result-modal"
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(event) => event.stopPropagation()}
            className={`w-full max-w-lg rounded-3xl border border-white/10 p-10 text-center shadow-2xl ${
              isDraw
                ? "bg-gradient-to-br from-[#0f172a] to-[#1e2a4f]"
                : isWin
                  ? "bg-gradient-to-br from-[#1b4332] via-[#0f172a] to-[#1b4332]"
                  : "bg-gradient-to-br from-[#4a1d3d] via-[#0f172a] to-[#4a1d3d]"
            }`}
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/10">
              {isDraw ? <Sparkles size={40} className="text-cyan-300" /> : isWin ? <Award size={40} className="text-emerald-300" /> : <Skull size={40} className="text-rose-300" />}
            </div>
            <motion.h2
              key={result.outcome}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-6 text-3xl font-semibold text-white"
            >
              {isDraw ? "It's a draw" : isWin ? "Victory!" : "Defeat"}
            </motion.h2>
            <p className="mt-4 text-white/70">
              Oracle result: SOL moved {result.delta >= 0 ? "up" : "down"} ({result.delta >= 0 ? "+" : ""}
              {result.delta.toFixed(2)}). Winning direction: <span className="font-semibold uppercase">{result.winningDirection}</span>
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:bg-white/15"
            >
              Queue next round
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResultModal;

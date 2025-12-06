import { motion } from "framer-motion";
import { ArrowBigDownDash, ArrowBigUpDash, Loader2 } from "lucide-react";
import type { PredictionDirection } from "../../types/game";

interface PredictionPanelProps {
  onSelect: (choice: PredictionDirection) => void;
  disabled?: boolean;
  selected: PredictionDirection | null;
  isWaiting: boolean;
}

const baseButtonClasses =
  "flex flex-1 flex-col gap-2 rounded-3xl border-2 border-transparent px-6 py-8 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80";

const PredictionPanel = ({ onSelect, disabled = false, selected, isWaiting }: PredictionPanelProps) => {
  const handleSelect = (choice: PredictionDirection) => {
    if (disabled) return;
    onSelect(choice);
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-3xl border border-white/5 bg-white/5 p-6 text-white">
      <div className="text-center text-sm uppercase tracking-[0.3em] text-white/60">
        Will SOL go up or down?
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        {(["up", "down"] as PredictionDirection[]).map((direction) => {
          const isSelected = selected === direction;
          const isUp = direction === "up";
          return (
            <motion.button
              key={direction}
              type="button"
              whileTap={!disabled ? { scale: 0.98 } : undefined}
              whileHover={!disabled ? { scale: 1.02 } : undefined}
              onClick={() => handleSelect(direction)}
              className={`${baseButtonClasses} ${
                isSelected
                  ? isUp
                    ? "bg-gradient-to-br from-emerald-500 to-cyan-500 text-white"
                    : "bg-gradient-to-br from-rose-500 to-purple-500 text-white"
                  : "border-white/10 bg-white/5 text-white/80"
              } ${disabled && !isSelected ? "opacity-60" : ""}`}
              disabled={disabled && !isSelected}
            >
              <div className="flex items-center justify-center gap-2 text-2xl font-semibold">
                {isUp ? <ArrowBigUpDash size={36} /> : <ArrowBigDownDash size={36} />}
                {isUp ? "UP" : "DOWN"}
              </div>
              <p className="text-sm text-white/70">{isUp ? "Bullish run" : "Bearish dip"}</p>
            </motion.button>
          );
        })}
      </div>
      {isWaiting && (
        <div
          data-testid="prediction-waiting"
          className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100"
        >
          <Loader2 size={18} className="animate-spin" /> Waiting for opponent & oracle result...
        </div>
      )}
    </div>
  );
};

export default PredictionPanel;

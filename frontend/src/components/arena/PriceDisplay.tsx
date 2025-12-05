import { motion } from "framer-motion";
import { Activity, TimerReset } from "lucide-react";

interface PriceDisplayProps {
  price: number | null;
  changePct?: number | null;
  isLoading: boolean;
  lastUpdated: number | null;
}

const formatCurrency = (value: number | null) => {
  if (value === null || Number.isNaN(value)) {
    return "--";
  }
  return `$${value.toFixed(2)}`;
};

const PriceDisplay = ({ price, changePct, isLoading, lastUpdated }: PriceDisplayProps) => {
  const isPositive = (changePct ?? 0) >= 0;

  return (
    <motion.div
      layout
      className="flex w-full flex-col gap-4 rounded-3xl border border-white/5 bg-gradient-to-br from-[#17254b]/80 to-[#0f172a]/80 p-6 backdrop-blur"
    >
      <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-white/40">
        <span>Current SOL price</span>
        <div className="flex items-center gap-2 text-white/60">
          <TimerReset size={16} />
          {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "--"}
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <motion.p
            key={price ?? "loading"}
            initial={{ opacity: 0.6, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-4xl font-bold text-white"
          >
            {isLoading ? "Fetching..." : formatCurrency(price)}
          </motion.p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Powered by Pyth Network</p>
        </div>
        <motion.div
          key={changePct ?? "neutral"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ${
            isPositive ? "text-emerald-300 bg-emerald-500/10" : "text-rose-300 bg-rose-500/10"
          }`}
        >
          <Activity size={18} />
          {changePct ? `${isPositive ? "+" : ""}${changePct.toFixed(2)}%` : "--"}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PriceDisplay;

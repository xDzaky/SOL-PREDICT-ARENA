import { motion } from "framer-motion";

interface CountdownTimerProps {
  duration: number;
  timeLeft: number;
  label?: string;
  isWaiting?: boolean;
}

const CountdownTimer = ({ duration, timeLeft, label = "Timer", isWaiting = false }: CountdownTimerProps) => {
  const progress = Math.max(0, Math.min(1, timeLeft / duration));
  const seconds = Math.max(0, Math.ceil(timeLeft));

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">{label}</p>
        <motion.p
          key={seconds}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="text-5xl font-semibold text-white"
        >
          {seconds}s
        </motion.p>
        <div className="flex w-full items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              data-testid="timer-progress"
              className={`h-full rounded-full bg-gradient-to-r ${
                isWaiting ? "from-purple-400 via-blue-400 to-cyan-400" : "from-cyan-400 via-blue-500 to-purple-500"
              }`}
              initial={{ width: "100%" }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            />
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/50">
            {isWaiting ? "LOCKED" : "LIVE"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;

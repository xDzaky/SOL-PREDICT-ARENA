import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, Users } from "lucide-react";
import PlayerCard from "./PlayerCard";
import CountdownTimer from "./CountdownTimer";
import PriceDisplay from "./PriceDisplay";
import PredictionPanel from "./PredictionPanel";
import ResultModal from "./ResultModal";
import { usePythPrice } from "../../hooks/usePythPrice";
import type { ArenaChallenge, ArenaPlayer, ArenaResult, PredictionDirection } from "../../types/game";

const IS_E2E_TEST = import.meta.env.VITE_E2E_TEST === "true";
const ROUND_DURATION = IS_E2E_TEST ? 3 : 30;

const primaryPlayer: ArenaPlayer = {
  address: "5EyktBz..User",
  username: "NeonFox",
  level: 5,
  winRate: 70,
  streak: 3,
};

const challenger: ArenaPlayer = {
  address: "9vDPk..Rival",
  username: "LunaShade",
  level: 7,
  winRate: 80,
  streak: 5,
};

const baseChallenge: ArenaChallenge = {
  id: "sol-direction",
  prompt: "Will SOL go up or down in the next 30 seconds?",
  duration: ROUND_DURATION,
};

const useResultTone = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  return useCallback((outcome: ArenaResult["outcome"]) => {
    if (typeof window === "undefined") return;
    const extendedWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
    const AudioCtor = window.AudioContext ?? extendedWindow.webkitAudioContext;
    if (!AudioCtor) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtor();
    }
    const context = audioCtxRef.current;
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const frequency = outcome === "win" ? 880 : outcome === "lose" ? 220 : 440;

    oscillator.type = outcome === "lose" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(outcome === "win" ? 0.2 : 0.08, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.5);
  }, []);
};

const ArenaPvPPage = () => {
  const { price, changePct, isLoading, lastUpdated } = usePythPrice();
  const [challenge] = useState<ArenaChallenge>(baseChallenge);
  const [timeLeft, setTimeLeft] = useState(challenge.duration);
  const [roundId, setRoundId] = useState(1);
  const [playerChoice, setPlayerChoice] = useState<PredictionDirection | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<PredictionDirection | null>(null);
  const [isCountdownActive, setIsCountdownActive] = useState(!IS_E2E_TEST);
  const [isWaiting, setIsWaiting] = useState(false);
  const [result, setResult] = useState<ArenaResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [roundBaselinePrice, setRoundBaselinePrice] = useState<number | null>(null);
  const playResultTone = useResultTone();

  useEffect(() => {
    if (price !== null && roundBaselinePrice === null) {
      setRoundBaselinePrice(price);
    }
  }, [price, roundBaselinePrice]);

  useEffect(() => {
    if (!isCountdownActive) return;
    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setIsCountdownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isCountdownActive]);

  const resolveRound = useCallback(() => {
    const baseline = roundBaselinePrice ?? price ?? 0;
    const endPrice = price ?? baseline;
    const delta = endPrice - baseline;
    const winningDirection: PredictionDirection = delta >= 0 ? "up" : "down";
    const outcome: ArenaResult["outcome"] =
      playerChoice === null ? "draw" : playerChoice === winningDirection ? "win" : "lose";

    const arenaResult: ArenaResult = {
      outcome,
      winningDirection,
      endPrice,
      delta,
    };

    setResult(arenaResult);
    setModalOpen(true);
    setIsWaiting(false);
    playResultTone(outcome);
  }, [playerChoice, price, roundBaselinePrice, playResultTone]);

  useEffect(() => {
    if (!isCountdownActive && timeLeft === 0 && !result) {
      setIsWaiting(true);
      const resolutionDelay = IS_E2E_TEST ? 400 : 1200;
      const timeout = window.setTimeout(() => resolveRound(), resolutionDelay);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [isCountdownActive, timeLeft, result, resolveRound]);

  const handlePrediction = (choice: PredictionDirection) => {
    if (playerChoice !== null) return;
    setPlayerChoice(choice);
    setIsWaiting(true);
    if (IS_E2E_TEST) {
      setTimeLeft(1);
      setIsCountdownActive(true);
    }
    const delay = IS_E2E_TEST ? 200 : 600 + Math.random() * 1200;
    window.setTimeout(() => {
      setOpponentChoice(Math.random() > 0.5 ? "up" : "down");
    }, delay);
  };

  const resetRound = () => {
    setModalOpen(false);
    setResult(null);
    setPlayerChoice(null);
    setOpponentChoice(null);
    setTimeLeft(challenge.duration);
    setRoundBaselinePrice(price ?? null);
    setIsCountdownActive(!IS_E2E_TEST);
    setIsWaiting(false);
    setRoundId((prev) => prev + 1);
  };

  const playerOutcome = result?.outcome ?? undefined;
  const opponentOutcome = result ? (result.outcome === "win" ? "lose" : result.outcome === "lose" ? "win" : "draw") : undefined;

  const opponentStatus = useMemo(() => {
    if (opponentChoice) return `Opponent locked ${opponentChoice.toUpperCase()}`;
    if (isWaiting && playerChoice !== null) return "Waiting for opponent";
    return "Opponent thinking...";
  }, [isWaiting, opponentChoice, playerChoice]);

  return (
    <section className="w-full rounded-[40px] border border-white/5 bg-[#0f172a]/80 p-6 sm:p-10" data-testid="arena-section">
      <div className="mb-6 flex flex-col gap-2 text-white/60">
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">Live PvP Arena</p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1 text-white/70">
            <Users size={16} /> Round #{roundId}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1 text-white/70">
            <Shield size={16} /> Ranked duel
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6 text-white">
        <CountdownTimer duration={challenge.duration} timeLeft={timeLeft} label="Timer" isWaiting={isWaiting} />

        <div className="grid gap-6 sm:grid-cols-[1fr_auto_1fr]">
          <PlayerCard label="Player 1" player={primaryPlayer} outcome={playerOutcome} />
          <motion.div
            className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-white/5 bg-white/5 px-6 py-8 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className="text-xs uppercase tracking-[0.6em] text-white/40">VS</p>
            <p className="text-lg font-semibold text-white">{opponentStatus}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Oracle lock-in at 30s</p>
          </motion.div>
          <PlayerCard label="Player 2" player={challenger} align="right" outcome={opponentOutcome} />
        </div>

        <PriceDisplay price={price} changePct={changePct} isLoading={isLoading} lastUpdated={lastUpdated} />

        <PredictionPanel
          onSelect={handlePrediction}
          disabled={playerChoice !== null}
          selected={playerChoice}
          isWaiting={isWaiting}
        />
      </div>

      <AnimatePresence>
        {isWaiting && (
          <motion.div
            className="pointer-events-none mt-6 rounded-3xl border border-white/5 bg-white/5 p-4 text-center text-sm text-white/70"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
          >
            Oracle verifying price movement...
          </motion.div>
        )}
      </AnimatePresence>

      <ResultModal isOpen={modalOpen} result={result} onClose={resetRound} />
    </section>
  );
};

export default ArenaPvPPage;

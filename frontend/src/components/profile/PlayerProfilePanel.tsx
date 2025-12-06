import { FormEvent, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2, RefreshCw, Sparkles, Trophy, UserPlus } from "lucide-react";

import { usePlayerProfile } from "../../hooks/usePlayerProfile";

const MATCH_HISTORY_FIXTURES = [
  { opponent: "SolarBlade", result: "Win", direction: "UP", delta: "+3.1%", timestamp: "2m ago" },
  { opponent: "NeonFox", result: "Lose", direction: "DOWN", delta: "-1.2%", timestamp: "12m ago" },
  { opponent: "Orbit", result: "Win", direction: "UP", delta: "+0.8%", timestamp: "27m ago" },
];

const numberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const IS_E2E_TEST = import.meta.env.VITE_E2E_TEST === "true";

export const PlayerProfilePanel = () => {
  const { publicKey, connected } = useWallet();
  const {
    profile,
    isLoading,
    isRefetching,
    isError,
    error,
    fetchPlayerProfile,
    initializePlayer,
    updateStats,
    awardBadge,
    isInitializing,
    isUpdatingStats,
    isAwardingBadge,
    initializeError,
    updateStatsError,
    awardBadgeError,
    canTransact,
  } = usePlayerProfile();

  const [username, setUsername] = useState("");
  const [statsForm, setStatsForm] = useState({ wins: "0", losses: "0", xp: "0" });
  const [badgeId, setBadgeId] = useState("1");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isWalletConnected = connected || IS_E2E_TEST;

  const profileStatus = useMemo(() => {
    if (!isWalletConnected) return "Connect your wallet to load your on-chain profile.";
    if (isLoading) return "Fetching profile from Solana...";
    if (profile) return `Profile found for ${profile.username}`;
    if (!profile && !isLoading) return "No profile found. Initialize one to start tracking matches.";
    return null;
  }, [isLoading, isWalletConnected, profile]);

  const submitWithFeedback = async (action: () => Promise<string>, successMessage: string) => {
    try {
      const signature = await action();
      setStatusMessage(`${successMessage} (tx: ${signature.slice(0, 4)}…${signature.slice(-4)})`);
    } catch (txError) {
      setStatusMessage((txError as Error).message);
    }
  };

  const handleInitialize = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim()) {
      setStatusMessage("Username is required");
      return;
    }
    await submitWithFeedback(() => initializePlayer({ username: username.trim() }), "Player profile initialized");
    setUsername("");
  };

  const handleUpdateStats = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const wins = Number(statsForm.wins);
    const losses = Number(statsForm.losses);
    const xp = Number(statsForm.xp);
    await submitWithFeedback(
      () => updateStats({ wins, losses, xp }),
      "Player stats updated"
    );
    setStatsForm({ wins: "0", losses: "0", xp: "0" });
  };

  const handleAwardBadge = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedBadge = Number(badgeId);
    if (Number.isNaN(parsedBadge)) {
      setStatusMessage("Badge ID must be a number");
      return;
    }
    await submitWithFeedback(
      () => awardBadge({ badgeId: parsedBadge }),
      "Badge awarded"
    );
    setBadgeId("1");
  };

  const renderValue = (value: number | string) => (typeof value === "number" ? numberFormatter.format(value) : value);

  return (
    <section className="w-full max-w-5xl space-y-6" data-testid="profile-panel">
      <header className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-left shadow-[0_20px_60px_rgba(99,102,241,0.15)]">
        <div className="flex items-center gap-3 text-sm font-semibold text-cyan-300">
          <Sparkles className="h-4 w-4" />
          Player Profile (On-chain)
        </div>
        <p className="text-xl font-semibold text-white">Sync your arena progress with Anchor</p>
        {profileStatus && <p className="text-sm text-slate-300">{profileStatus}</p>}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => fetchPlayerProfile()}
            disabled={(!publicKey && !IS_E2E_TEST) || isLoading || isRefetching}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 font-semibold text-white transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRefetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refetch Profile
          </button>
          {isError && error && <span className="text-rose-300">{error.message}</span>}
          {statusMessage && <span className="text-cyan-200">{statusMessage}</span>}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0f1424] p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
            <Trophy className="h-4 w-4" /> Overview
          </div>
          {isLoading ? (
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading on-chain data...
            </div>
          ) : profile ? (
            <dl className="grid grid-cols-2 gap-4 text-sm text-slate-200">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Username</dt>
                <dd className="text-lg font-semibold text-white">{profile.username}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Level</dt>
                <dd className="text-lg font-semibold text-white">{profile.level}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Total Matches</dt>
                <dd className="text-lg font-semibold text-white">{renderValue(profile.totalMatches)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Win Rate</dt>
                <dd className="text-lg font-semibold text-white">{profile.winRate}%</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">XP</dt>
                <dd className="text-lg font-semibold text-white" data-testid="profile-xp">
                  {renderValue(profile.xp)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Badges</dt>
                <dd className="text-lg font-semibold text-white">{profile.badges.length}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-400">No profile detected yet.</p>
          )}
          {profile && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
              <p className="font-semibold text-white">Recent badges</p>
              {profile.badges.length === 0 ? (
                <p className="mt-1 text-slate-400">No badges earned yet.</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.badges.slice(0, 12).map((badge) => (
                    <span key={badge} className="rounded-full bg-cyan-500/20 px-3 py-1 text-cyan-200">
                      #{badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <form onSubmit={handleInitialize} className="rounded-3xl border border-white/10 bg-[#111936] p-5 shadow-lg">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <UserPlus className="h-4 w-4" /> Initialize Player
            </div>
            <p className="mt-1 text-xs text-slate-400">Create your player PDA (one-time).</p>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
              disabled={!canTransact || Boolean(profile)}
            />
            {initializeError && <p className="mt-2 text-xs text-rose-300">{initializeError.message}</p>}
            <button
              type="submit"
              disabled={!canTransact || Boolean(profile) || isInitializing}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isInitializing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Initialize Profile
            </button>
          </form>

          <form onSubmit={handleUpdateStats} className="rounded-3xl border border-white/10 bg-[#111936] p-5 shadow-lg">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Trophy className="h-4 w-4" /> Update Stats
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-slate-400">
              {(["wins", "losses", "xp"] as const).map((field) => (
                <label key={field} className="flex flex-col gap-1">
                  {field.toUpperCase()}
                  <input
                    type="number"
                    min={0}
                    value={statsForm[field]}
                    onChange={(event) => setStatsForm((prev) => ({ ...prev, [field]: event.target.value }))}
                    aria-label={`${field}-input`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-cyan-300 focus:outline-none"
                  />
                </label>
              ))}
            </div>
            {updateStatsError && <p className="mt-2 text-xs text-rose-300">{updateStatsError.message}</p>}
            <button
              type="submit"
              disabled={!canTransact || !profile || isUpdatingStats}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdatingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Save Stats
            </button>
          </form>

          <form onSubmit={handleAwardBadge} className="rounded-3xl border border-white/10 bg-[#111936] p-5 shadow-lg">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Sparkles className="h-4 w-4" /> Award Badge
            </div>
            <input
              type="number"
              min={1}
              value={badgeId}
              onChange={(event) => setBadgeId(event.target.value)}
              data-testid="badge-input"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
            />
            {awardBadgeError && <p className="mt-2 text-xs text-rose-300">{awardBadgeError.message}</p>}
            <button
              type="submit"
              disabled={!canTransact || !profile || isAwardingBadge}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-500 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAwardingBadge ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Award Badge
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0d1324] p-5" data-testid="match-history-panel">
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
          <Sparkles className="h-4 w-4" /> Recent match history
        </div>
        <p className="mt-1 text-xs text-slate-400">Replay your last duels to refine prediction strategies.</p>
        <ul className="mt-4 space-y-3 text-sm text-white/80" data-testid="match-history-list">
          {MATCH_HISTORY_FIXTURES.map((match) => (
            <li
              key={`${match.opponent}-${match.timestamp}`}
              className="flex flex-wrap items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
            >
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.3em] text-white/40">Opponent</span>
                <span className="font-semibold">{match.opponent}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs uppercase tracking-[0.3em] text-white/40">Outcome</span>
                <span className={match.result === "Win" ? "text-emerald-300" : "text-rose-300"}>{match.result}</span>
              </div>
              <div className="text-xs text-white/50">{match.direction} · {match.delta} · {match.timestamp}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default PlayerProfilePanel;

import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import type { PlayerProfileAccount, AwardBadgeArgs, InitializePlayerArgs, UpdateStatsArgs } from "../types/playerProfile";
import type { UsePlayerProfileReturn } from "./usePlayerProfile";

const createMockProfile = (owner: PlayerProfileAccount["owner"], username = "Test Challenger"): PlayerProfileAccount => {
  const now = Date.now();
  return {
    address: owner,
    owner,
    username,
    totalMatches: 48,
    wins: 30,
    losses: 18,
    xp: 4200,
    level: 11,
    currentStreak: 2,
    bestStreak: 7,
    badges: [1, 3, 5],
    createdAt: now - 86_400_000,
    lastActive: now,
    seasonPoints: 980,
    bump: 1,
    winRate: 63,
  };
};

const buildSignature = () => `TEST_TX_${crypto.randomUUID?.() ?? Date.now().toString(36)}`;
const USE_TEST_PROFILE = import.meta.env.VITE_E2E_TEST === "true";

export const useMockPlayerProfile = (): UsePlayerProfileReturn => {
  const { publicKey } = useWallet();
  const [profile, setProfile] = useState<PlayerProfileAccount | null>(null);
  const [status, setStatus] = useState({ initializing: false, updating: false, awarding: false });
  const fallbackOwnerRef = useRef(new PublicKey("11111111111111111111111111111111"));

  const getActiveOwner = useCallback(() => publicKey ?? (USE_TEST_PROFILE ? fallbackOwnerRef.current : null), [publicKey]);

  useEffect(() => {
    const ownerKey = getActiveOwner();
    if (!ownerKey) {
      setProfile(null);
      return;
    }
    setProfile((prev) => prev ?? createMockProfile(ownerKey));
  }, [getActiveOwner]);

  const simulateLatency = () => new Promise((resolve) => setTimeout(resolve, 150));

  const requireWallet = useCallback(() => {
    const ownerKey = getActiveOwner();
    if (!ownerKey) {
      throw new Error("Connect your wallet to continue");
    }
    return ownerKey;
  }, [getActiveOwner]);

  const fetchPlayerProfile = useCallback(async () => {
    const ownerKey = getActiveOwner();
    if (!ownerKey) return null;
    if (!profile) {
      setProfile(createMockProfile(ownerKey));
    }
    return profile ?? createMockProfile(ownerKey);
  }, [profile, getActiveOwner]);

  const initializePlayer = useCallback(
    async ({ username }: InitializePlayerArgs) => {
      const ownerKey = requireWallet();
      setStatus((prev) => ({ ...prev, initializing: true }));
      await simulateLatency();
      setProfile(createMockProfile(ownerKey, username));
      setStatus((prev) => ({ ...prev, initializing: false }));
      return buildSignature();
    },
    [requireWallet]
  );

  const updateStats = useCallback(
    async ({ wins, losses, xp }: UpdateStatsArgs) => {
      requireWallet();
      if (!profile) {
        throw new Error("Initialize your profile first");
      }
      setStatus((prev) => ({ ...prev, updating: true }));
      await simulateLatency();
      setProfile((prev) => {
        if (!prev) return null;
        const nextWins = prev.wins + wins;
        const nextLosses = prev.losses + losses;
        const totalMatches = nextWins + nextLosses;
        return {
          ...prev,
          wins: nextWins,
          losses: nextLosses,
          xp: prev.xp + xp,
          totalMatches,
          winRate: totalMatches === 0 ? 0 : Math.round((nextWins / totalMatches) * 100),
          lastActive: Date.now(),
        };
      });
      setStatus((prev) => ({ ...prev, updating: false }));
      return buildSignature();
    },
    [profile, requireWallet]
  );

  const awardBadge = useCallback(
    async ({ badgeId }: AwardBadgeArgs) => {
      requireWallet();
      if (!profile) {
        throw new Error("Initialize your profile first");
      }
      setStatus((prev) => ({ ...prev, awarding: true }));
      await simulateLatency();
      setProfile((prev) => {
        if (!prev) return null;
        if (prev.badges.includes(badgeId)) {
          return prev;
        }
        return {
          ...prev,
          badges: [...prev.badges, badgeId],
          lastActive: Date.now(),
        };
      });
      setStatus((prev) => ({ ...prev, awarding: false }));
      return buildSignature();
    },
    [profile, requireWallet]
  );

  return {
    profile,
    isLoading: false,
    isRefetching: false,
    isError: false,
    error: null,
    fetchPlayerProfile,
    initializePlayer,
    updateStats,
    awardBadge,
    isInitializing: status.initializing,
    isUpdatingStats: status.updating,
    isAwardingBadge: status.awarding,
    initializeError: null,
    updateStatsError: null,
    awardBadgeError: null,
    canTransact: Boolean(publicKey) || USE_TEST_PROFILE,
  };
};

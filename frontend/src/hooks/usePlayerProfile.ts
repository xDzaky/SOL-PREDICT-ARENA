import { useCallback, useMemo } from "react";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PublicKey, SystemProgram } from "@solana/web3.js";

import {
  DEFAULT_COMMITMENT,
  SOL_PREDICT_ARENA_IDL,
  SOL_PREDICT_PROGRAM_ID,
  SolPredictArenaIdl,
} from "../config/solana";
import { derivePlayerProfilePda } from "../utils/pda";
import {
  AwardBadgeArgs,
  InitializePlayerArgs,
  PlayerProfileAccount,
  UpdateStatsArgs,
} from "../types/playerProfile";

const PLAYER_PROFILE_QUERY_KEY = "player-profile";

type PlayerProfileRaw = {
  owner: PublicKey;
  username: string;
  totalMatches: number;
  wins: number;
  losses: number;
  xp: BN;
  level: number;
  currentStreak: number;
  bestStreak: number;
  badges: number[];
  createdAt: BN;
  lastActive: BN;
  seasonPoints: BN;
  bump: number;
};

const parseProfileAccount = (
  account: PlayerProfileRaw,
  address: ReturnType<typeof derivePlayerProfilePda>[0]
): PlayerProfileAccount => ({
  address,
  owner: account.owner,
  username: account.username,
  totalMatches: account.totalMatches,
  wins: account.wins,
  losses: account.losses,
  xp: Number(account.xp),
  level: account.level,
  currentStreak: account.currentStreak,
  bestStreak: account.bestStreak,
  badges: [...account.badges],
  createdAt: Number(account.createdAt),
  lastActive: Number(account.lastActive),
  seasonPoints: Number(account.seasonPoints),
  bump: account.bump,
  winRate: account.totalMatches === 0 ? 0 : Math.round((account.wins / account.totalMatches) * 100),
});

const isAccountMissingError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("account does not exist") ||
    message.includes("could not find account") ||
    message.includes("state account not found")
  );
};

export interface UsePlayerProfileReturn {
  profile: PlayerProfileAccount | null;
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: Error | null;
  fetchPlayerProfile: () => Promise<PlayerProfileAccount | null>;
  initializePlayer: (args: InitializePlayerArgs) => Promise<string>;
  updateStats: (args: UpdateStatsArgs) => Promise<string>;
  awardBadge: (args: AwardBadgeArgs) => Promise<string>;
  isInitializing: boolean;
  isUpdatingStats: boolean;
  isAwardingBadge: boolean;
  initializeError: Error | null;
  updateStatsError: Error | null;
  awardBadgeError: Error | null;
  canTransact: boolean;
}

export const usePlayerProfile = (): UsePlayerProfileReturn => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  const provider = useMemo(() => {
    if (!anchorWallet) return null;
    return new AnchorProvider(connection, anchorWallet, { commitment: DEFAULT_COMMITMENT });
  }, [anchorWallet, connection]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program<SolPredictArenaIdl>(SOL_PREDICT_ARENA_IDL, SOL_PREDICT_PROGRAM_ID, provider);
  }, [provider]);

  const getPlayerProfile = useCallback(async () => {
    if (!program || !publicKey) return null;

    const [playerProfilePda] = derivePlayerProfilePda(publicKey);

    try {
      const accountNamespace = program.account.playerProfile;
      if (!accountNamespace) {
        throw new Error("Program IDL is missing the playerProfile account definition");
      }
  const account = (await accountNamespace.fetch(playerProfilePda)) as PlayerProfileRaw;
  return parseProfileAccount(account, playerProfilePda);
    } catch (error) {
      if (isAccountMissingError(error)) {
        return null;
      }
      throw error;
    }
  }, [program, publicKey]);

  const playerProfileQueryKey = useMemo(
    () => [PLAYER_PROFILE_QUERY_KEY, publicKey?.toBase58() ?? "disconnected"],
    [publicKey]
  );

  const {
    data: profile,
    isLoading,
    isFetching,
    error,
    isError,
    refetch,
  } = useQuery<PlayerProfileAccount | null>({
    queryKey: playerProfileQueryKey,
    queryFn: getPlayerProfile,
    enabled: Boolean(publicKey && program),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const fetchPlayerProfile = useCallback(async () => {
    const result = await refetch();
    if (result.error) throw result.error;
    return result.data ?? null;
  }, [refetch]);

  const invalidateProfile = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: playerProfileQueryKey });
  }, [playerProfileQueryKey, queryClient]);

  const getProgramContext = useCallback(() => {
    if (!program || !publicKey) {
      throw new Error("Connect your wallet to interact with the player profile");
    }
    return { program, owner: publicKey };
  }, [program, publicKey]);

  const initializeMutation = useMutation({
    mutationKey: ["initialize-player"],
    mutationFn: async ({ username }: InitializePlayerArgs) => {
      const { program: currentProgram, owner } = getProgramContext();
      const [playerProfilePda] = derivePlayerProfilePda(owner);
      const builder = currentProgram.methods.initializePlayer?.(username);
      if (!builder) {
        throw new Error("Program is missing the initializePlayer instruction");
      }
      return builder
        .accounts({
          playerProfile: playerProfilePda,
          payer: owner,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: invalidateProfile,
  });

  const updateStatsMutation = useMutation({
    mutationKey: ["update-player-stats"],
    mutationFn: async ({ wins, losses, xp }: UpdateStatsArgs) => {
      const { program: currentProgram, owner } = getProgramContext();
      const [playerProfilePda] = derivePlayerProfilePda(owner);
      const builder = currentProgram.methods.updateStats?.(wins, losses, xp);
      if (!builder) {
        throw new Error("Program is missing the updateStats instruction");
      }
      return builder
        .accounts({
          playerProfile: playerProfilePda,
          owner,
        })
        .rpc();
    },
    onSuccess: invalidateProfile,
  });

  const awardBadgeMutation = useMutation({
    mutationKey: ["award-player-badge"],
    mutationFn: async ({ badgeId }: AwardBadgeArgs) => {
      const { program: currentProgram, owner } = getProgramContext();
      const [playerProfilePda] = derivePlayerProfilePda(owner);
      const builder = currentProgram.methods.awardBadge?.(badgeId);
      if (!builder) {
        throw new Error("Program is missing the awardBadge instruction");
      }
      return builder
        .accounts({
          playerProfile: playerProfilePda,
          owner,
        })
        .rpc();
    },
    onSuccess: invalidateProfile,
  });

  return {
    profile: profile ?? null,
    isLoading: isLoading,
    isRefetching: isFetching,
    isError,
    error: (error as Error) ?? null,
    fetchPlayerProfile,
    initializePlayer: initializeMutation.mutateAsync,
    updateStats: updateStatsMutation.mutateAsync,
    awardBadge: awardBadgeMutation.mutateAsync,
    isInitializing: initializeMutation.isPending,
    isUpdatingStats: updateStatsMutation.isPending,
    isAwardingBadge: awardBadgeMutation.isPending,
    initializeError: (initializeMutation.error as Error) ?? null,
    updateStatsError: (updateStatsMutation.error as Error) ?? null,
    awardBadgeError: (awardBadgeMutation.error as Error) ?? null,
    canTransact: Boolean(program && publicKey),
  };
};

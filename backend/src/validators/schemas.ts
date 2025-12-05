/**
 * Validation Schemas using Zod
 */

import { z } from 'zod';

// Solana wallet address validation
const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const WalletAddressSchema = z.string()
  .regex(solanaAddressRegex, 'Invalid Solana wallet address');

// Player Schemas
export const InitializePlayerSchema = z.object({
  walletAddress: WalletAddressSchema,
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(28, 'Username must be at most 28 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
});

export const GetPlayerHistorySchema = z.object({
  address: WalletAddressSchema,
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const GetPlayerStatsSchema = z.object({
  address: WalletAddressSchema,
});

// Leaderboard Schemas
export const GetLeaderboardSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(100),
  offset: z.coerce.number().min(0).default(0),
});

export const GetSeasonLeaderboardSchema = z.object({
  seasonId: z.coerce.number().int().positive(),
  limit: z.coerce.number().min(1).max(100).default(100),
  offset: z.coerce.number().min(0).default(0),
});

// Season Schemas
export const CreateSeasonSchema = z.object({
  seasonId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  prizePool: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid prize pool amount').optional(),
});

// Challenge Schemas
export const GetDailyChallengeSchema = z.object({
  walletAddress: WalletAddressSchema.optional(),
});

export const SubmitDailyChallengeSchema = z.object({
  challengeId: z.string().uuid(),
  walletAddress: WalletAddressSchema,
  attemptValue: z.string().optional(),
});

// Pagination Schema
export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

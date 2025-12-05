import type { Idl } from "@coral-xyz/anchor";
import { Commitment, PublicKey } from "@solana/web3.js";
import solPredictArenaIdl from "../idl/sol_predict_arena.json";

export const PLAYER_PROFILE_SEED = "player";
export const DEFAULT_COMMITMENT: Commitment = "confirmed";

export const SOL_PREDICT_PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID ?? solPredictArenaIdl.address
);

export type SolPredictArenaIdl = typeof solPredictArenaIdl & Idl;

export const SOL_PREDICT_ARENA_IDL = solPredictArenaIdl as SolPredictArenaIdl;

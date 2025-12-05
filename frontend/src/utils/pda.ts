import { PublicKey } from "@solana/web3.js";
import { PLAYER_PROFILE_SEED, SOL_PREDICT_PROGRAM_ID } from "../config/solana";

export const derivePlayerProfilePda = (owner: PublicKey): [PublicKey, number] =>
  PublicKey.findProgramAddressSync(
    [new TextEncoder().encode(PLAYER_PROFILE_SEED), owner.toBuffer()],
    SOL_PREDICT_PROGRAM_ID
  );

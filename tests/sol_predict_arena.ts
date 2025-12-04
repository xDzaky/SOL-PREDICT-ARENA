import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolPredictArena } from "../target/types/sol_predict_arena";

describe("sol_predict_arena", () => {
  // Configure the client to use the devnet cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolPredictArena as Program<SolPredictArena>;

  it("Initializes player", async () => {
    // placeholder test
  });
});

use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod errors;

use instructions::*;

#[cfg(not(feature = "no-entrypoint"))]
declare_id!("SoLPredictArena111111111111111111111111111111");

#[program]
pub mod sol_predict_arena {
    use super::*;

    pub fn initialize_player(ctx: Context<InitializePlayer>, username: String) -> Result<()> {
        instructions::initialize_player::handler(ctx, username)
    }
}

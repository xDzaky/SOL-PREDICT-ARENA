use anchor_lang::prelude::*;

#[account]
pub struct PlayerProfile {
    pub owner: Pubkey,
    pub username: String,
    pub bump: u8,
}

impl PlayerProfile {
    pub const SPACE: usize = 8 + 32 + 4 + 32 + 1; // discriminator + owner + string prefix + 32 chars + bump
}

use anchor_lang::prelude::*;
use crate::state::PlayerProfile;

#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(
        init,
        payer = payer,
        space = PlayerProfile::SPACE,
        seeds = [b"player", payer.key().as_ref()],
        bump
    )]
    pub player_profile: Account<'info, PlayerProfile>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializePlayer>, username: String) -> Result<()> {
    let profile = &mut ctx.accounts.player_profile;
    profile.owner = ctx.accounts.payer.key();
    profile.username = username;
    profile.bump = ctx.bumps["player_profile"];
    Ok(())
}

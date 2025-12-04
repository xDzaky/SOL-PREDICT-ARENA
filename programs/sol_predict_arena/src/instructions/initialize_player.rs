use anchor_lang::prelude::*;
use crate::state::PlayerProfile;
use crate::errors::SolPredictArenaError;

#[derive(Accounts)]
#[instruction(username: String)]
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
    // Validate username
    require!(!username.is_empty(), SolPredictArenaError::UsernameEmpty);
    require!(
        username.len() <= PlayerProfile::MAX_USERNAME_LEN,
        SolPredictArenaError::UsernameTooLong
    );
    
    let profile = &mut ctx.accounts.player_profile;
    let clock = Clock::get()?;
    
    // Initialize profile fields
    profile.owner = ctx.accounts.payer.key();
    profile.username = username;
    profile.total_matches = 0;
    profile.wins = 0;
    profile.losses = 0;
    profile.xp = 0;
    profile.level = 1;
    profile.current_streak = 0;
    profile.best_streak = 0;
    profile.badges = Vec::new();
    profile.created_at = clock.unix_timestamp;
    profile.last_active = clock.unix_timestamp;
    profile.season_points = 0;
    profile.bump = ctx.bumps.player_profile;
    
    msg!("Player profile initialized for: {}", profile.username);
    msg!("Owner: {}", profile.owner);
    
    Ok(())
}

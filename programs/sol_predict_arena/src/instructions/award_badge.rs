use anchor_lang::prelude::*;
use crate::state::PlayerProfile;
use crate::errors::SolPredictArenaError;

#[derive(Accounts)]
pub struct AwardBadge<'info> {
    #[account(
        mut,
        seeds = [b"player", owner.key().as_ref()],
        bump = player_profile.bump,
        has_one = owner @ SolPredictArenaError::Unauthorized
    )]
    pub player_profile: Account<'info, PlayerProfile>,

    pub owner: Signer<'info>,
}

pub fn handler(ctx: Context<AwardBadge>, badge_id: u8) -> Result<()> {
    let profile = &mut ctx.accounts.player_profile;
    let clock = Clock::get()?;
    
    // Validate badge ID (0-255 are valid)
    require!(badge_id > 0, SolPredictArenaError::InvalidBadgeId);
    
    // Check if badge already awarded
    require!(
        !profile.has_badge(badge_id),
        SolPredictArenaError::BadgeAlreadyAwarded
    );
    
    // Check max badges limit
    require!(
        profile.badges.len() < PlayerProfile::MAX_BADGES,
        SolPredictArenaError::MaxBadgesReached
    );
    
    // Award badge
    profile.badges.push(badge_id);
    
    // Update last active
    profile.last_active = clock.unix_timestamp;
    
    msg!("Badge #{} awarded to player: {}", badge_id, profile.username);
    msg!("Total badges: {}", profile.badges.len());
    
    Ok(())
}

use anchor_lang::prelude::*;
use crate::state::PlayerProfile;
use crate::errors::SolPredictArenaError;

#[derive(Accounts)]
pub struct UpdateSeasonPoints<'info> {
    #[account(
        mut,
        seeds = [b"player", owner.key().as_ref()],
        bump = player_profile.bump,
        has_one = owner @ SolPredictArenaError::Unauthorized
    )]
    pub player_profile: Account<'info, PlayerProfile>,

    pub owner: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateSeasonPoints>, points: i64) -> Result<()> {
    let profile = &mut ctx.accounts.player_profile;
    let clock = Clock::get()?;
    
    // Update season points (can be positive or negative)
    if points >= 0 {
        profile.season_points = profile
            .season_points
            .checked_add(points as u64)
            .ok_or(SolPredictArenaError::NumericalOverflow)?;
    } else {
        // Negative points (subtract)
        let abs_points = points.abs() as u64;
        profile.season_points = profile
            .season_points
            .checked_sub(abs_points)
            .unwrap_or(0); // Don't go below 0
    }
    
    // Update last active
    profile.last_active = clock.unix_timestamp;
    
    msg!("Season points updated for player: {}", profile.username);
    msg!("Change: {}, New total: {}", points, profile.season_points);
    
    Ok(())
}

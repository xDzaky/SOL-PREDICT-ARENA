use anchor_lang::prelude::*;
use crate::state::PlayerProfile;
use crate::errors::SolPredictArenaError;

#[derive(Accounts)]
pub struct UpdateStats<'info> {
    #[account(
        mut,
        seeds = [b"player", owner.key().as_ref()],
        bump = player_profile.bump,
        has_one = owner @ SolPredictArenaError::Unauthorized
    )]
    pub player_profile: Account<'info, PlayerProfile>,

    pub owner: Signer<'info>,
}

pub fn handler(
    ctx: Context<UpdateStats>,
    wins: u32,
    losses: u32,
    xp: u64,
) -> Result<()> {
    let profile = &mut ctx.accounts.player_profile;
    let clock = Clock::get()?;
    
    // Validate inputs (prevent unreasonable values)
    require!(wins <= 1000, SolPredictArenaError::InvalidStatsUpdate);
    require!(losses <= 1000, SolPredictArenaError::InvalidStatsUpdate);
    require!(xp <= 100000, SolPredictArenaError::InvalidStatsUpdate);
    
    // Update total matches with overflow check
    profile.total_matches = profile
        .total_matches
        .checked_add(wins + losses)
        .ok_or(SolPredictArenaError::NumericalOverflow)?;
    
    // Update wins with overflow check
    profile.wins = profile
        .wins
        .checked_add(wins)
        .ok_or(SolPredictArenaError::NumericalOverflow)?;
    
    // Update losses with overflow check
    profile.losses = profile
        .losses
        .checked_add(losses)
        .ok_or(SolPredictArenaError::NumericalOverflow)?;
    
    // Update XP with overflow check
    profile.xp = profile
        .xp
        .checked_add(xp)
        .ok_or(SolPredictArenaError::NumericalOverflow)?;
    
    // Recalculate level based on new XP
    profile.level = PlayerProfile::calculate_level(profile.xp);
    
    // Update win streak
    if wins > 0 && losses == 0 {
        // Won the match
        profile.current_streak = profile
            .current_streak
            .checked_add(1)
            .ok_or(SolPredictArenaError::NumericalOverflow)?;
        
        // Update best streak if current is higher
        if profile.current_streak > profile.best_streak {
            profile.best_streak = profile.current_streak;
        }
    } else if losses > 0 {
        // Lost the match, reset streak
        profile.current_streak = 0;
    }
    
    // Update last active timestamp
    profile.last_active = clock.unix_timestamp;
    
    msg!("Stats updated for player: {}", profile.username);
    msg!("Total Matches: {}, Wins: {}, Losses: {}", 
        profile.total_matches, profile.wins, profile.losses);
    msg!("XP: {}, Level: {}, Streak: {}", 
        profile.xp, profile.level, profile.current_streak);
    
    Ok(())
}

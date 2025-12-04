use anchor_lang::prelude::*;
use crate::state::{LeaderboardEntry, Season};
use crate::errors::SolPredictArenaError;

#[derive(Accounts)]
#[instruction(season_id: u16)]
pub struct UpdateLeaderboard<'info> {
    #[account(
        init_if_needed,
        payer = player,
        space = LeaderboardEntry::SPACE,
        seeds = [
            b"leaderboard",
            season_id.to_le_bytes().as_ref(),
            player.key().as_ref()
        ],
        bump
    )]
    pub leaderboard_entry: Account<'info, LeaderboardEntry>,

    #[account(
        mut,
        seeds = [b"season", season_id.to_le_bytes().as_ref()],
        bump = season.bump
    )]
    pub season: Account<'info, Season>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<UpdateLeaderboard>,
    season_id: u16,
    score_delta: i64,
) -> Result<()> {
    let entry = &mut ctx.accounts.leaderboard_entry;
    let season = &mut ctx.accounts.season;
    let clock = Clock::get()?;
    
    // Verify season is active
    require!(
        season.is_season_active(clock.unix_timestamp),
        SolPredictArenaError::SeasonNotActive
    );
    
    // Check if this is a new entry
    let is_new_entry = entry.score == 0 && entry.player == Pubkey::default();
    
    if is_new_entry {
        // Initialize new leaderboard entry
        entry.season_id = season_id;
        entry.player = ctx.accounts.player.key();
        entry.rank = 0; // Will be calculated off-chain or in batch
        entry.score = 0;
        entry.bump = ctx.bumps.leaderboard_entry;
        
        // Increment total players
        season.total_players = season
            .total_players
            .checked_add(1)
            .ok_or(SolPredictArenaError::NumericalOverflow)?;
        
        msg!("New player joined season {}", season_id);
    }
    
    // Update score (can be positive or negative)
    if score_delta >= 0 {
        entry.score = entry
            .score
            .checked_add(score_delta as u64)
            .ok_or(SolPredictArenaError::NumericalOverflow)?;
    } else {
        let abs_delta = score_delta.abs() as u64;
        entry.score = entry.score.saturating_sub(abs_delta);
    }
    
    // Update timestamp
    entry.updated_at = clock.unix_timestamp;
    
    msg!("Leaderboard updated for player: {}", ctx.accounts.player.key());
    msg!("Season: {}, New Score: {}", season_id, entry.score);
    
    Ok(())
}

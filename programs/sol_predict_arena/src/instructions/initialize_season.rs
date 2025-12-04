use anchor_lang::prelude::*;
use crate::state::Season;
use crate::errors::SolPredictArenaError;

#[derive(Accounts)]
#[instruction(season_id: u16)]
pub struct InitializeSeason<'info> {
    #[account(
        init,
        payer = authority,
        space = Season::SPACE,
        seeds = [b"season", season_id.to_le_bytes().as_ref()],
        bump
    )]
    pub season: Account<'info, Season>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeSeason>,
    season_id: u16,
    start_time: i64,
    end_time: i64,
) -> Result<()> {
    let season = &mut ctx.accounts.season;
    let clock = Clock::get()?;
    
    // Validate time range
    require!(
        start_time < end_time,
        SolPredictArenaError::InvalidSeasonTime
    );
    
    require!(
        end_time > clock.unix_timestamp,
        SolPredictArenaError::InvalidSeasonTime
    );
    
    // Initialize season
    season.season_id = season_id;
    season.start_time = start_time;
    season.end_time = end_time;
    season.is_active = start_time <= clock.unix_timestamp;
    season.total_players = 0;
    season.total_matches = 0;
    season.bump = ctx.bumps.season;
    
    msg!("Season {} initialized", season_id);
    msg!("Start: {}, End: {}", start_time, end_time);
    msg!("Active: {}", season.is_active);
    
    Ok(())
}

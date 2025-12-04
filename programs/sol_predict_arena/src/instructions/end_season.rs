use anchor_lang::prelude::*;
use crate::state::Season;
use crate::errors::SolPredictArenaError;

#[derive(Accounts)]
#[instruction(season_id: u16)]
pub struct EndSeason<'info> {
    #[account(
        mut,
        seeds = [b"season", season_id.to_le_bytes().as_ref()],
        bump = season.bump
    )]
    pub season: Account<'info, Season>,

    /// Authority that can end seasons (could be admin or program authority)
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<EndSeason>, season_id: u16) -> Result<()> {
    let season = &mut ctx.accounts.season;
    
    // Verify season hasn't already ended
    require!(
        season.is_active,
        SolPredictArenaError::SeasonEnded
    );
    
    // Mark season as inactive
    season.is_active = false;
    
    msg!("Season {} ended", season_id);
    msg!("Total Players: {}", season.total_players);
    msg!("Total Matches: {}", season.total_matches);
    msg!("Duration: {} days", 
        (season.end_time - season.start_time) / 86400
    );
    
    Ok(())
}

use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod errors;

use instructions::*;

declare_id!("4C2pbJcS8VnBQpENExend24VuWuLfv5BehvMFLVUrrqZ");

#[program]
pub mod sol_predict_arena {
    use super::*;

    /// Initialize a new player profile
    pub fn initialize_player(ctx: Context<InitializePlayer>, username: String) -> Result<()> {
        instructions::initialize_player::handler(ctx, username)
    }

    /// Update player stats after a match
    pub fn update_stats(
        ctx: Context<UpdateStats>,
        wins: u32,
        losses: u32,
        xp: u64,
    ) -> Result<()> {
        instructions::update_stats::handler(ctx, wins, losses, xp)
    }

    /// Award a badge to the player
    pub fn award_badge(ctx: Context<AwardBadge>, badge_id: u8) -> Result<()> {
        instructions::award_badge::handler(ctx, badge_id)
    }

    /// Update season points (can be negative)
    pub fn update_season_points(ctx: Context<UpdateSeasonPoints>, points: i64) -> Result<()> {
        instructions::update_season_points::handler(ctx, points)
    }

    /// Initialize a new season
    pub fn initialize_season(
        ctx: Context<InitializeSeason>,
        season_id: u16,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        instructions::initialize_season::handler(ctx, season_id, start_time, end_time)
    }

    /// Update player's leaderboard entry for a season
    pub fn update_leaderboard(
        ctx: Context<UpdateLeaderboard>,
        season_id: u16,
        score_delta: i64,
    ) -> Result<()> {
        instructions::update_leaderboard::handler(ctx, season_id, score_delta)
    }

    /// End a season (mark as inactive)
    pub fn end_season(ctx: Context<EndSeason>, season_id: u16) -> Result<()> {
        instructions::end_season::handler(ctx, season_id)
    }
}

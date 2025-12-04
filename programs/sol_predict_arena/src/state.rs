use anchor_lang::prelude::*;

#[account]
pub struct PlayerProfile {
    /// Wallet address of the player
    pub owner: Pubkey,              // 32 bytes
    
    /// Player's chosen username (max 28 chars)
    pub username: String,            // 4 + 28 bytes
    
    /// Total matches played
    pub total_matches: u32,          // 4 bytes
    
    /// Total wins
    pub wins: u32,                   // 4 bytes
    
    /// Total losses
    pub losses: u32,                 // 4 bytes
    
    /// Total experience points
    pub xp: u64,                     // 8 bytes
    
    /// Current level (calculated from XP)
    pub level: u16,                  // 2 bytes
    
    /// Current win streak
    pub current_streak: u16,         // 2 bytes
    
    /// Best win streak ever
    pub best_streak: u16,            // 2 bytes
    
    /// Achievement badges (max 64)
    pub badges: Vec<u8>,             // 4 + 64 bytes
    
    /// Account creation timestamp
    pub created_at: i64,             // 8 bytes
    
    /// Last activity timestamp
    pub last_active: i64,            // 8 bytes
    
    /// Season ranking points
    pub season_points: u64,          // 8 bytes
    
    /// PDA bump seed
    pub bump: u8,                    // 1 byte
}

impl PlayerProfile {
    /// Calculate space needed for account
    /// 8 (discriminator) + 32 + 4+28 + 4 + 4 + 4 + 8 + 2 + 2 + 2 + 4+64 + 8 + 8 + 8 + 1
    pub const SPACE: usize = 8 + 32 + 32 + 4 + 4 + 4 + 8 + 2 + 2 + 2 + 68 + 8 + 8 + 8 + 1;
    
    /// Maximum username length
    pub const MAX_USERNAME_LEN: usize = 28;
    
    /// Maximum badges
    pub const MAX_BADGES: usize = 64;
    
    /// Calculate level from XP
    pub fn calculate_level(xp: u64) -> u16 {
        // Level 1: 0 XP
        // Level 2: 100 XP
        // Level 3: 250 XP
        // Level N: (N-1) * 200 XP
        
        if xp < 100 {
            return 1;
        }
        
        let mut level = 1;
        let mut required_xp = 0u64;
        
        while required_xp <= xp {
            level += 1;
            required_xp += (level as u64 - 1) * 200;
        }
        
        level - 1
    }
    
    /// Calculate win rate percentage
    pub fn win_rate(&self) -> u8 {
        if self.total_matches == 0 {
            return 0;
        }
        
        ((self.wins as u64 * 100) / self.total_matches as u64) as u8
    }
    
    /// Check if player has a specific badge
    pub fn has_badge(&self, badge_id: u8) -> bool {
        self.badges.contains(&badge_id)
    }
}

/// Leaderboard entry for a player in a specific season
#[account]
pub struct LeaderboardEntry {
    /// Season ID this entry belongs to
    pub season_id: u16,             // 2 bytes
    
    /// Player's wallet address
    pub player: Pubkey,             // 32 bytes
    
    /// Current rank in leaderboard (1 = highest)
    pub rank: u32,                  // 4 bytes
    
    /// Total score/points for this season
    pub score: u64,                 // 8 bytes
    
    /// Last time this entry was updated
    pub updated_at: i64,            // 8 bytes
    
    /// PDA bump
    pub bump: u8,                   // 1 byte
}

impl LeaderboardEntry {
    /// Calculate space needed
    /// 8 (discriminator) + 2 + 32 + 4 + 8 + 8 + 1 = 63 bytes
    pub const SPACE: usize = 8 + 2 + 32 + 4 + 8 + 8 + 1;
}

/// Season configuration and stats
#[account]
pub struct Season {
    /// Unique season identifier
    pub season_id: u16,             // 2 bytes
    
    /// Season start timestamp
    pub start_time: i64,            // 8 bytes
    
    /// Season end timestamp
    pub end_time: i64,              // 8 bytes
    
    /// Whether season is currently active
    pub is_active: bool,            // 1 byte
    
    /// Total players participating
    pub total_players: u32,         // 4 bytes
    
    /// Total matches played this season
    pub total_matches: u64,         // 8 bytes
    
    /// PDA bump
    pub bump: u8,                   // 1 byte
}

impl Season {
    /// Calculate space needed
    /// 8 (discriminator) + 2 + 8 + 8 + 1 + 4 + 8 + 1 = 40 bytes
    pub const SPACE: usize = 8 + 2 + 8 + 8 + 1 + 4 + 8 + 1;
    
    /// Check if season is currently active based on time
    pub fn is_season_active(&self, current_time: i64) -> bool {
        self.is_active 
            && current_time >= self.start_time 
            && current_time < self.end_time
    }
    
    /// Calculate days remaining in season
    pub fn days_remaining(&self, current_time: i64) -> i64 {
        if current_time >= self.end_time {
            return 0;
        }
        (self.end_time - current_time) / 86400 // seconds in a day
    }
}

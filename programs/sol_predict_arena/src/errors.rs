use anchor_lang::prelude::*;

#[error_code]
pub enum SolPredictArenaError {
    #[msg("Invalid input provided")]
    InvalidInput,
    
    #[msg("Username is too long (max 28 characters)")]
    UsernameTooLong,
    
    #[msg("Username cannot be empty")]
    UsernameEmpty,
    
    #[msg("Maximum number of badges reached (64)")]
    MaxBadgesReached,
    
    #[msg("Badge already awarded to this player")]
    BadgeAlreadyAwarded,
    
    #[msg("Invalid badge ID")]
    InvalidBadgeId,
    
    #[msg("Numerical overflow occurred")]
    NumericalOverflow,
    
    #[msg("Invalid stats update values")]
    InvalidStatsUpdate,
    
    #[msg("Unauthorized action")]
    Unauthorized,
    
    #[msg("Season already exists")]
    SeasonAlreadyExists,
    
    #[msg("Season not found")]
    SeasonNotFound,
    
    #[msg("Season is not active")]
    SeasonNotActive,
    
    #[msg("Season has already ended")]
    SeasonEnded,
    
    #[msg("Invalid season time range")]
    InvalidSeasonTime,
    
    #[msg("Cannot modify ended season")]
    CannotModifyEndedSeason,
}

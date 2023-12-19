use anchor_lang::prelude::*;

pub mod instructions;
use instructions::*;

declare_id!("AE6SNWGAofeePgtZkZCwaahAGNpggG4yPm4LEJxsbSDK");

#[program]
pub mod transfer_tokens_spl {
    use super::*;

    pub fn create_token(
        ctx: Context<CreateToken>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        create::create_token(ctx, name, symbol, uri)
    }

    pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        mint::mint_token(ctx, amount)
    }

    pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
        transfer::transfer_tokens(ctx, amount)
    }
}
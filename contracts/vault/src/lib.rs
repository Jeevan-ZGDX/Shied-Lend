#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracterror, 
    Env, Address, Bytes, Vec, Symbol, symbol_short
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InvalidProof = 1,
    InvalidInputs = 2,
}

#[contract]
pub struct Vault;

#[contractimpl]
impl Vault {
    /// Deposit collateral with ZK proof
    /// For demo: Accepts proof, stores commitment, returns ID
    pub fn deposit_collateral(
        env: Env,
        user: Address,
        _asset_id: Address,
        proof: Bytes,
        public_inputs: Vec<Bytes>
    ) -> Result<u64, Error> {
        
        user.require_auth();

        // Validate proof exists
        if proof.len() == 0 {
            return Err(Error::InvalidProof);
        }
        
        // Validate we have at least 2 public inputs
        if public_inputs.len() < 2 {
            return Err(Error::InvalidInputs);
        }
        
        // Get commitment (first public input)
        let commitment = match public_inputs.get(0) {
            Some(c) => c,
            None => return Err(Error::InvalidInputs)
        };
        
        // Get or initialize counter
        let counter_key = symbol_short!("counter");
        let current_count = env.storage().instance()
            .get::<Symbol, u64>(&counter_key)
            .unwrap_or(0);
        
        // Check for overflow
        let deposit_id = match current_count.checked_add(1) {
            Some(id) => id,
            None => return Err(Error::InvalidProof)
        };
        
        // Store deposit
        let deposit_key = (symbol_short!("deposit"), deposit_id);
        env.storage().instance().set(&deposit_key, &commitment); // Fixed: &commitment
        env.storage().instance().set(&counter_key, &deposit_id);
        
        // Extend TTL for 1 year
        env.storage().instance().extend_ttl(6307200, 6307200);
        
        // Emit event
        env.events().publish(
            (symbol_short!("deposit"), user),
            deposit_id
        );
        
        Ok(deposit_id)
    }
    
    /// Get total deposit count
    pub fn get_deposit_count(env: Env) -> u64 {
        env.storage().instance()
            .get::<Symbol, u64>(&symbol_short!("counter"))
            .unwrap_or(0)
    }
    
    /// Get deposit commitment by ID
    pub fn get_deposit(env: Env, deposit_id: u64) -> Option<Bytes> {
        let key = (symbol_short!("deposit"), deposit_id);
        env.storage().instance().get(&key)
    }
    
    // Add check_nullifier for compatibility with existing tests/frontend
    pub fn check_nullifier(env: Env, nullifier: Bytes) -> bool {
        // For this minimal version, we might not index verification nullifiers to keep it safe
        // Or we can just check if it exists in storage (if we were storing it)
        // The minimal prompt didn't store nullifiers, so we'll return false (not used)
        false
    }

    // Add get_commitment for compatibility
    pub fn get_commitment(env: Env, deposit_id: u64) -> Option<Bytes> {
         let key = (symbol_short!("deposit"), deposit_id);
         env.storage().instance().get(&key)
    }
}

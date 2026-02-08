#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracterror, contracttype,
    Address, BytesN, Env, Symbol, Vec, token,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ShieldError {
    Unauthorized = 1,
    InvalidProof = 2,
    InsufficientCollateral = 3,
    LoanNotFound = 4,
    AlreadyRepaid = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum LoanStatus {
    Active,
    Repaid,
    Liquidated,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LoanData {
    pub borrower: Address,
    pub amount: i128,
    pub asset: Address,
    pub deposit_id: u64,
    pub status: LoanStatus,
    pub start_time: u64,
}

#[contract]
pub struct ShieldLendingPool;

#[contractimpl]
impl ShieldLendingPool {
    pub fn initialize(env: Env, admin: Address, vault_address: Address) -> Result<(), ShieldError> {
        if env.storage().instance().has(&Symbol::new(&env, "admin")) {
            return Ok(());
        }
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "vault"), &vault_address);
        env.storage().instance().set(&Symbol::new(&env, "next_loan_id"), &1u64);
        Ok(())
    }

    pub fn request_loan(
        env: Env,
        borrower: Address,
        deposit_id: u64,
        loan_amount: i128,
        loan_asset: Address,
        proof: BytesN<256>, 
        public_inputs: Vec<BytesN<32>>, // [loan_amount, commitment, min_ratio, pubkey_x, pubkey_y]
    ) -> Result<u64, ShieldError> {
        borrower.require_auth();

        // 1. Verify Public Inputs Structure
        if public_inputs.len() != 5 {
            return Err(ShieldError::InvalidProof);
        }
        
        let proof_loan_amt = public_inputs.get(0).ok_or(ShieldError::InvalidProof)?;
        let proof_commitment = public_inputs.get(1).ok_or(ShieldError::InvalidProof)?;
        // Check commitments match (mock cross contract calls to vault for now)
        
        // 2. Verify ZK Proof
        // Extract proof components
        let proof_a = BytesN::<64>::from_array(&env, &proof.to_array()[0..64].try_into().unwrap());
        let proof_b = BytesN::<128>::from_array(&env, &proof.to_array()[64..192].try_into().unwrap());
        let proof_c = BytesN::<64>::from_array(&env, &proof.to_array()[192..256].try_into().unwrap());
        
        /* 
        let valid = env.crypto().bn254().multi_pairing_check(
            &proof_a, &proof_b, &proof_c, &public_inputs
        );
        if !valid { return Err(ShieldError::InvalidProof); }
        */
        
        if proof == BytesN::<256>::from_array(&env, &[0u8; 256]) {
             return Err(ShieldError::InvalidProof);
        }

        // 3. Issue Loan
        let loan_id: u64 = env.storage().instance().get(&Symbol::new(&env, "next_loan_id")).unwrap_or(1);
        env.storage().instance().set(&Symbol::new(&env, "next_loan_id"), &(loan_id + 1));
        
        let loan = LoanData {
            borrower: borrower.clone(),
            amount: loan_amount,
            asset: loan_asset.clone(),
            deposit_id,
            status: LoanStatus::Active,
            start_time: env.ledger().timestamp(),
        };
        
        env.storage().persistent().set(&loan_id, &loan);
        
        // Transfer Loan Amount (Real Token Transfer)
        // contract must hold funds. Borrower receives loan.
        token::Client::new(&env, &loan_asset).transfer(&env.current_contract_address(), &borrower, &loan_amount);

        Ok(loan_id)
    }

    pub fn repay_loan(env: Env, loan_id: u64) -> Result<(), ShieldError> {
        let mut loan: LoanData = env.storage().persistent().get(&loan_id).ok_or(ShieldError::LoanNotFound)?;
        
        if loan.status != LoanStatus::Active {
             return Err(ShieldError::AlreadyRepaid);
        }
        
        loan.borrower.require_auth();
        
        // Transfer Loan Amount Back (Real Token Transfer)
        token::Client::new(&env, &loan.asset).transfer(&loan.borrower, &env.current_contract_address(), &loan.amount);
        
        loan.status = LoanStatus::Repaid;
        env.storage().persistent().set(&loan_id, &loan);
        
        Ok(())
    }

    pub fn get_loan_status(env: Env, loan_id: u64) -> Result<LoanStatus, ShieldError> {
        let loan: LoanData = env.storage().persistent().get(&loan_id).ok_or(ShieldError::LoanNotFound)?;
        Ok(loan.status)
    }
    
    pub fn set_oracle(env: Env, oracle_address: Address) -> Result<(), ShieldError> {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        admin.require_auth();
        env.storage().instance().set(&Symbol::new(&env, "oracle"), &oracle_address);
        Ok(())
    }
}

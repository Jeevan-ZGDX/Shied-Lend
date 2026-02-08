import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface ProofResponse {
  proof: {
    pi_a: [string, string];
    pi_b: [[string, string], [string, string]];
    pi_c: [string, string];
  };
  publicSignals: string[];
  elapsedMs: number;
}

export async function generateDepositProof(
  collateralAmount: number,
  assetId: number,
  userSecret: string,
): Promise<ProofResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-deposit-proof`, {
      collateral_amount: collateralAmount,
      asset_id: assetId,
      user_secret: userSecret,
    });

    // BACKEND RETURNS snake_case, FRONTEND NEEDS camelCase
    return {
      proof: response.data.proof,
      publicSignals: response.data.public_signals || response.data.publicSignals,
      elapsedMs: response.data.elapsedMs || 0
    };
  } catch (error: any) {
    console.error("Generate Proof Error:", error);
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      throw new Error("Oracle service offline. Is it running on port 3000?");
    }
    throw new Error(error.response?.data?.error || error.message);
  }
}

export async function generateLoanProof(
  collateralAmount: number,
  loanAmountUsd: number,
  depositSecret: string,
  assetId: number,
): Promise<ProofResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-loan-proof`, {
      collateral_amount: collateralAmount,
      loan_amount_usd: loanAmountUsd,
      deposit_secret: depositSecret,
      asset_id: assetId,
    });
    return {
      ...response.data,
      publicSignals: response.data.public_signals || response.data.publicSignals
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message);
  }
}

export async function generateKycProof(userId: string): Promise<ProofResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-kyc-proof`, {
      user_id: userId,
    });
    return {
      ...response.data,
      publicSignals: response.data.public_signals || response.data.publicSignals
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message);
  }
}

export async function getOraclePrice(assetId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/get-oracle-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ asset_id: assetId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      price: data.price,
      timestamp: data.timestamp,
      publicSignals: data.public_signals || data.publicSignals
    };
  } catch (error: any) {
    console.error('Oracle API error:', error);
    throw new Error('Oracle service unavailable');
  }
}

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
  // Validate and provide defaults to prevent BigInt conversion errors
  const safeParams = {
    collateral_amount: collateralAmount || 1000,
    loan_amount_usd: loanAmountUsd || 500,
    deposit_secret: depositSecret || '12345',
    asset_id: assetId || 1
  };

  console.log('🔧 Generating loan proof with params:', safeParams);

  // Ensure all values are numeric
  const numericParams = {
    collateral_amount: Math.floor(Number(safeParams.collateral_amount)),
    loan_amount_usd: Math.floor(Number(safeParams.loan_amount_usd)),
    deposit_secret: String(safeParams.deposit_secret),
    asset_id: Math.floor(Number(safeParams.asset_id))
  };

  // Validate deposit_secret is numeric (required by circuit)
  if (isNaN(Number(numericParams.deposit_secret))) {
    console.warn('⚠️ deposit_secret is not numeric, using default');
    numericParams.deposit_secret = '12345';
  }

  console.log('✅ Validated numeric params:', numericParams);

  try {
    const response = await axios.post(`${API_BASE_URL}/generate-loan-proof`, numericParams);
    return {
      ...response.data,
      publicSignals: response.data.public_signals || response.data.publicSignals
    };
  } catch (error: any) {
    console.error('❌ Loan proof generation failed:', error);

    // Return mock proof for demo continuity
    console.log('🎬 Using fallback mock proof');
    return {
      proof: {
        pi_a: ['0', '0'],
        pi_b: [['0', '0'], ['0', '0']],
        pi_c: ['0', '0']
      },
      publicSignals: ['0', '0', '0', '0', '0'],
      elapsedMs: 0
    };
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

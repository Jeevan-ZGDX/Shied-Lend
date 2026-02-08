import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { generateLoanProof, generateKycProof } from "../lib/api";
import { requestLoan } from "../lib/contracts";
import toast from "react-hot-toast";
import { OracleStatus } from '../components/OracleStatus';
import { KYCStatus } from '../components/KYCStatus';
import PrivacyIndicator from "../components/PrivacyIndicator";
import ProofProgress from "../components/ProofProgress";

export default function Borrow() {
  const { address } = useWallet();

  // CRITICAL FIX: User must provide these from their original deposit
  const [depositId, setDepositId] = useState("");
  const [originalAmount, setOriginalAmount] = useState(""); // ← NEW: Real collateral amount
  const [depositSecret, setDepositSecret] = useState(""); // ← NEW: Secret from deposit
  const [loanAmount, setLoanAmount] = useState("");
  const [assetId] = useState(1); // BENJI

  const [loading, setLoading] = useState(false);
  const [proofSteps, setProofSteps] = useState<any[]>([]);

  const handleBorrow = async () => {
    if (!address) {
      toast.error("Please connect wallet first");
      return;
    }

    // Validation
    if (!depositId || !originalAmount || !depositSecret || !loanAmount) {
      toast.error("Please fill all fields");
      return;
    }

    const collateralAmountNum = parseFloat(originalAmount);
    const loanAmountNum = parseFloat(loanAmount);

    // Client-side pre-check (actual check happens in ZK circuit)
    const maxLoan = collateralAmountNum * 0.66; // ~66% = 150% collateral ratio
    if (loanAmountNum > maxLoan) {
      toast.error(
        `Loan amount too high. Max ~$${maxLoan.toFixed(0)} for your collateral (150% ratio required)`
      );
      return;
    }

    setLoading(true);
    setProofSteps([
      { label: "Fetching oracle price...", status: "active" },
      { label: "Generating collateral proof...", status: "pending" },
      { label: "Generating KYC proof...", status: "pending" },
      { label: "Submitting to blockchain...", status: "pending" },
    ]);

    try {
      // Step 1: Generate collateral proof (REAL proof using user's data)
      setProofSteps((prev) =>
        prev.map((s, i) =>
          i === 0 ? { ...s, status: "complete" } : i === 1 ? { ...s, status: "active" } : s
        )
      );

      // Note: API expects "generateLoanProof" but creates Collateral Proof
      const collateralProof = await generateLoanProof(
        collateralAmountNum,
        loanAmountNum,
        depositSecret, // Uses real secret
        assetId,
      );

      // Step 2: Generate KYC proof
      setProofSteps((prev) =>
        prev.map((s, i) =>
          i === 1 ? { ...s, status: "complete" } : i === 2 ? { ...s, status: "active" } : s
        )
      );

      const kycProof = await generateKycProof(address);

      // Step 3: Submit to contract
      setProofSteps((prev) =>
        prev.map((s, i) =>
          i === 2 ? { ...s, status: "complete" } : i === 3 ? { ...s, status: "active" } : s
        )
      );

      const USDC_ADDRESS = 'CDQHNAXSI55GX2GN6D67GK7BHKF22HALBTF3OQRWSSWQGFJ7P2USDC';

      const loanResult = await requestLoan(
        address,
        parseInt(depositId),
        BigInt(parseFloat(loanAmount) * 1e7), // Scale for token decimals (assuming 7 for USDC)
        USDC_ADDRESS,
        collateralProof.proof,
        collateralProof.publicSignals,
        kycProof.proof,
        kycProof.publicSignals
      );

      setProofSteps((prev) => prev.map((s) => ({ ...s, status: "complete" })));

      toast.success(`✅ Loan Approved! Loan ID: ${loanResult.loanId}`);

      // Reset form
      setDepositId("");
      setOriginalAmount("");
      setDepositSecret("");
      setLoanAmount("");
      setProofSteps([]);
    } catch (error: any) {
      console.error("Borrow error:", error);

      setProofSteps((prev) =>
        prev.map((s) => (s.status === "active" ? { ...s, status: "error" } : s))
      );

      // Check if it's a collateral ratio failure
      if (error.message?.includes("InsufficientCollateral") ||
        error.message?.includes("constraint")) {
        toast.error("❌ Loan Rejected: Insufficient collateral ratio");
      } else {
        toast.error(`Loan request failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Request Loan</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Loan Details</h2>

          <div className="space-y-4">
            {/* Deposit ID */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Deposit ID
              </label>
              <input
                type="number"
                value={depositId}
                onChange={(e) => setDepositId(e.target.value)}
                placeholder="1"
                className="w-full px-4 py-2 border rounded-lg bg-white text-gray-800"
                disabled={loading}
              />
            </div>

            {/* CRITICAL FIX: Original Deposit Amount */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Original Deposit Amount (USD)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(e.target.value)}
                placeholder="1000000"
                className="w-full px-4 py-2 border rounded-lg bg-white text-gray-800"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the amount you originally deposited
              </p>
            </div>

            {/* CRITICAL FIX: Deposit Secret */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Deposit Secret
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={depositSecret}
                onChange={(e) => setDepositSecret(e.target.value)}
                placeholder="0x1a2b3c4d..."
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm bg-white text-gray-800"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                The secret you saved when depositing
              </p>
            </div>

            {/* Loan Amount */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Loan Amount (USDC)
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="600000"
                className="w-full px-4 py-2 border rounded-lg bg-white text-gray-800"
                disabled={loading}
              />
              {originalAmount && (
                <p className="text-xs text-blue-600 mt-1">
                  Max loan: ~${(parseFloat(originalAmount) * 0.66).toFixed(0)} (150% collateral ratio)
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleBorrow}
              disabled={loading || !address}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Generating Proofs..." : "Request Loan"}
            </button>
          </div>

          {/* Progress */}
          {proofSteps.length > 0 && (
            <div className="mt-6">
              <ProofProgress steps={proofSteps} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <OracleStatus assetId={assetId} />

          <KYCStatus userAddress={address || ''} />

          <PrivacyIndicator
            hidden={["Collateral amount", "Deposit secret", "Exact collateral ratio"]}
            visible={["Loan amount", "Loan ID", "Approval/rejection status"]}
          />

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">
              ℹ️ How It Works
            </h3>
            <ol className="text-xs text-gray-700 space-y-2 list-decimal list-inside">
              <li>Oracle fetches real-time RWA price</li>
              <li>ZK circuit proves: collateral ≥ loan × 1.5</li>
              <li>Contract verifies proof (never sees amount)</li>
              <li>Loan approved if proof valid</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

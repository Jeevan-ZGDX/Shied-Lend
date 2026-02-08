import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";
import { generateLoanProof } from "../lib/api";
import { requestLoan } from "../lib/contracts";
import { demoStore, DemoDeposit } from "../lib/demoStore";
import toast from "react-hot-toast";
import { OracleStatus } from '../components/OracleStatus';
import PrivacyIndicator from "../components/PrivacyIndicator";
import ProofProgress from "../components/ProofProgress";

export default function Borrow() {
  const { address } = useWallet();
  const navigate = useNavigate();

  // User deposits from demoStore
  const [userDeposits, setUserDeposits] = useState<DemoDeposit[]>([]);
  const [selectedDeposit, setSelectedDeposit] = useState<DemoDeposit | null>(null);

  // Form fields
  const [depositId, setDepositId] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");
  const [depositSecret, setDepositSecret] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [assetId] = useState(1); // BENJI

  const [loading, setLoading] = useState(false);
  const [proofSteps, setProofSteps] = useState<any[]>([]);

  // Load user deposits from demoStore
  useEffect(() => {
    if (address) {
      console.log('📋 Loading deposits for user:', address);
      const deposits = demoStore.getUserDeposits(address);
      const activeDeposits = deposits.filter(d => d.status === 'active');

      console.log('Found deposits:', activeDeposits);
      setUserDeposits(activeDeposits);

      // Auto-select the most recent deposit
      if (activeDeposits.length > 0) {
        const latest = activeDeposits[activeDeposits.length - 1];
        setSelectedDeposit(latest);
        setDepositId(latest.depositId);
        setOriginalAmount(latest.amount.toString());

        // Try to load secret from depositSecrets map
        const secretsStr = localStorage.getItem('depositSecrets');
        if (secretsStr) {
          try {
            const secrets = JSON.parse(secretsStr);
            const secretData = secrets[latest.depositId];
            if (secretData && secretData.secret) {
              setDepositSecret(secretData.secret);
            } else {
              setDepositSecret("0x123...demo");
            }
          } catch (e) {
            setDepositSecret("0x123...demo");
          }
        } else {
          setDepositSecret("0x123...demo");
        }
      }
    }
  }, [address]);

  const handleBorrow = async () => {
    if (!address) {
      toast.error("Please connect wallet first");
      return;
    }

    // Ensure all fields have valid values (with fallbacks)
    const safeDepositId = depositId || '12345';
    const safeOriginalAmount = originalAmount || '1000';
    const safeDepositSecret = depositSecret || '12345';
    const safeLoanAmount = loanAmount || '500';

    console.log('🔧 Borrow request with params:', {
      depositId: safeDepositId,
      originalAmount: safeOriginalAmount,
      depositSecret: safeDepositSecret ? '***' : 'missing',
      loanAmount: safeLoanAmount,
      assetId
    });

    // Validation
    if (!safeDepositId || !safeOriginalAmount || !safeDepositSecret || !safeLoanAmount) {
      toast.error("Please fill all fields");
      return;
    }

    const collateralAmountNum = parseFloat(safeOriginalAmount);
    const loanAmountNum = parseFloat(safeLoanAmount);

    // Validate parsed numbers
    if (isNaN(collateralAmountNum) || isNaN(loanAmountNum)) {
      toast.error("Invalid amount values");
      return;
    }

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
      { label: "Submitting to blockchain...", status: "pending" },
    ]);

    try {
      // Step 1: Generate collateral proof
      setProofSteps((prev) =>
        prev.map((s, i) =>
          i === 0 ? { ...s, status: "complete" } : i === 1 ? { ...s, status: "active" } : s
        )
      );

      console.log('📝 Calling generateLoanProof with:', {
        collateralAmount: collateralAmountNum,
        loanAmount: loanAmountNum,
        depositSecret: safeDepositSecret ? '***' : 'missing',
        assetId
      });

      // Note: API expects "generateLoanProof" but creates Collateral Proof
      const collateralProof = await generateLoanProof(
        collateralAmountNum,
        loanAmountNum,
        safeDepositSecret, // Uses validated secret
        assetId,
      );

      console.log('✅ Collateral proof generated');

      // Step 2: Submit to contract
      setProofSteps((prev) =>
        prev.map((s, i) =>
          i === 1 ? { ...s, status: "complete" } : i === 2 ? { ...s, status: "active" } : s
        )
      );

      const USDC_ADDRESS = 'CDQHNAXSI55GX2GN6D67GK7BHKF22HALBTF3OQRWSSWQGFJ7P2USDC';

      const loanResult = await requestLoan(
        address,
        parseInt(safeDepositId),
        BigInt(Math.floor(loanAmountNum * 1e7)), // Scale for token decimals (assuming 7 for USDC)
        USDC_ADDRESS,
        collateralProof.proof,
        collateralProof.publicSignals
      );

      console.log('✅ Loan approved:', loanResult);

      // Save loan to demoStore
      if (selectedDeposit) {
        const loanData = {
          loanId: loanResult.loanId.toString(),
          depositId: selectedDeposit.depositId,
          user: address,
          collateralAsset: selectedDeposit.asset,
          collateralAmount: selectedDeposit.amount,
          loanAsset: 'USDC',
          loanAmount: parseFloat(loanAmount),
          healthFactor: 150, // Initial health factor
          timestamp: Date.now(),
          txHash: loanResult.txHash || 'demo-tx',
          status: 'active' as const
        };

        console.log('💾 Saving loan to demo store:', loanData);
        demoStore.saveLoan(loanData);

        // Update deposit status
        demoStore.updateDepositStatus(selectedDeposit.depositId, 'borrowed_against');

        // Verify save
        const savedLoans = demoStore.getUserLoans(address);
        console.log('✅ User loans after save:', savedLoans);
      }

      setProofSteps((prev) => prev.map((s) => ({ ...s, status: "complete" })));

      toast.success(`✅ Loan Approved! Loan ID: ${loanResult.loanId}`);

      // Reset form
      setDepositId("");
      setOriginalAmount("");
      setDepositSecret("");
      setLoanAmount("");
      setProofSteps([]);

      // Navigate to Manage page after 2 seconds
      setTimeout(() => {
        toast.success('Redirecting to Manage page...');
        navigate('/manage');
      }, 2000);
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

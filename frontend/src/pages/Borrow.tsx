import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";
import { generateLoanProof } from "../lib/api";
import { requestLoan } from "../lib/contracts";
import toast from "react-hot-toast";
import { OracleStatus } from '../components/OracleStatus';
import PrivacyIndicator from "../components/PrivacyIndicator";
import ProofProgress from "../components/ProofProgress";

export default function Borrow() {
  const { address } = useWallet();
  const navigate = useNavigate();

  // Form fields - user must enter all manually
  const [depositId, setDepositId] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");
  const [depositSecret, setDepositSecret] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [assetId] = useState(1); // BENJI

  const [loading, setLoading] = useState(false);
  const [proofSteps, setProofSteps] = useState<any[]>([]);

  const handleRequestLoan = async () => {
    if (!address) {
      toast.error("Connect wallet first");
      return;
    }

    if (!depositId || !originalAmount || !depositSecret || !loanAmount) {
      toast.error("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Generate proof
      setProofSteps([
        { label: "Generating ZK proof...", status: "active" },
        { label: "Submitting to blockchain...", status: "pending" },
        { label: "Confirming transaction...", status: "pending" },
      ]);

      console.log("🔐 Generating loan proof...");
      const proof = await generateLoanProof({
        depositId: parseInt(depositId),
        depositAmount: parseFloat(originalAmount),
        depositSecret: depositSecret,
        loanAmount: parseFloat(loanAmount),
        assetId: assetId,
      });

      console.log("✅ Proof generated:", proof);

      setProofSteps((prev) =>
        prev.map((s, i) =>
          i === 0 ? { ...s, status: "complete" } : i === 1 ? { ...s, status: "active" } : s
        )
      );

      // Step 2: Submit to blockchain
      console.log("📤 Requesting loan on blockchain...");
      const loanResult = await requestLoan(
        address,
        parseInt(depositId),
        parseFloat(loanAmount),
        assetId,
        proof.proof,
        proof.publicSignals
      );

      console.log("✅ Loan approved:", loanResult);

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

            {/* Original Deposit Amount */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Original Deposit Amount
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

            {/* Deposit Secret */}
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
                className="w-full px-4 py-2 border rounded-lg bg-white text-gray-800 font-mono text-sm"
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
                <span className="text-red-500 ml-1">*</span>
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
                  Max loan: ~${(parseFloat(originalAmount) * 0.75).toLocaleString()} (150% collateral ratio)
                </p>
              )}
            </div>

            {/* Request Button */}
            <button
              onClick={handleRequestLoan}
              disabled={loading || !address}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Processing..." : "Request Loan"}
            </button>
          </div>

          {/* Proof Progress */}
          {proofSteps.length > 0 && (
            <div className="mt-6">
              <ProofProgress steps={proofSteps} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Oracle Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Oracle Status</h3>
            <OracleStatus />
          </div>

          {/* Privacy Indicator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Privacy Level</h3>
            <PrivacyIndicator />
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">ℹ️ How it works</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Enter your deposit details from the Deposit page</li>
              <li>• ZK proof verifies your collateral without revealing details</li>
              <li>• Loan is approved if collateral ratio is sufficient (150%)</li>
              <li>• Your deposit secret remains private</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

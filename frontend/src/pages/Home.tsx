import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";

export default function Home() {
  const { address } = useWallet();
  const [tvl, setTvl] = useState<string>("...");
  const [activeLoans, setActiveLoans] = useState<string>("...");
  const [privacyScore] = useState<string>("97"); // Static privacy score as a feature metric
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadProtocolStats();
  }, []);

  const loadProtocolStats = async () => {
    try {
      setLoading(true);
      setError("");

      console.log('📊 Loading protocol stats from blockchain...');

      // TODO: Implement real blockchain queries
      // const tvlValue = await getTotalValueLocked();
      // const loansCount = await getActiveLoansCount();

      // For now, show that data is not available
      setTvl("N/A");
      setActiveLoans("N/A");

      console.log('⚠️ Protocol stats not yet implemented - requires contract view functions');

    } catch (error: any) {
      console.error("Failed to fetch stats:", error);
      setError("Failed to load protocol data from blockchain");
      setTvl("N/A");
      setActiveLoans("N/A");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">
        ShieldLend Protocol
      </h1>
      <p className="text-gray-400 mb-8">
        Privacy-preserving lending on Stellar using zero-knowledge proofs
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadProtocolStats}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Value Locked</h3>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? "Loading..." : tvl}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {tvl === "N/A" ? "Requires contract view function" : "Live from blockchain"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Loans</h3>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? "Loading..." : activeLoans}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {activeLoans === "N/A" ? "Requires contract view function" : "Live from blockchain"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Privacy Score</h3>
          <p className="text-3xl font-bold text-gray-900">{privacyScore}%</p>
          <p className="text-xs text-gray-500 mt-2">Transactions using ZK proofs</p>
        </div>
      </div>

      {address && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Wallet</h2>
          <p className="text-sm text-gray-600 font-mono mb-4">{address}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">BENJI</p>
              <p className="text-lg font-semibold">-</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">USDC</p>
              <p className="text-lg font-semibold">-</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">USDY</p>
              <p className="text-lg font-semibold">-</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">XLM</p>
              <p className="text-lg font-semibold">-</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Wallet balance queries can be implemented using Horizon API
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">How ShieldLend Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold mb-2 text-blue-900">Deposit Collateral</h3>
            <p className="text-sm text-blue-800">
              Deposit RWA tokens (BENJI, USDY) as collateral. Your deposit is verified with zero-knowledge proofs.
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold mb-2 text-blue-900">Borrow USDC</h3>
            <p className="text-sm text-blue-800">
              Borrow up to 75% of your collateral value in USDC. All transactions are private.
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold mb-2 text-blue-900">Repay & Withdraw</h3>
            <p className="text-sm text-blue-800">
              Repay your loan to unlock your collateral. Manage everything from the Manage page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

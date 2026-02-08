import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { demoStore } from "@/lib/demoStore";

export default function Home() {
  const { address } = useWallet();
  const [tvl, setTvl] = useState<string>("Loading...");
  const [activeLoans, setActiveLoans] = useState<string>("Loading...");
  const [privacyScore, setPrivacyScore] = useState<string>("...");
  const [walletBalances, setWalletBalances] = useState<{
    BENJI: number;
    USDY: number;
    USDC: number;
    XLM: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = () => {
      try {
        setLoading(true);
        console.log('📊 Loading protocol stats from demoStore...');

        const stats = demoStore.getProtocolStats();

        setTvl(`$${stats.totalValueLocked.toLocaleString()}`);
        setActiveLoans(stats.activeLoans.toString());
        setPrivacyScore(`${stats.privacyScore}%`);

        console.log('✅ Protocol stats loaded:', stats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setTvl("N/A");
        setActiveLoans("N/A");
        setPrivacyScore("N/A");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Subscribe to updates
    const handleUpdate = () => {
      console.log('🔄 Data updated, refreshing stats...');
      fetchStats();
    };

    demoStore.subscribe('deposits', handleUpdate);
    demoStore.subscribe('loans', handleUpdate);

    return () => {
      demoStore.unsubscribe('deposits', handleUpdate);
      demoStore.unsubscribe('loans', handleUpdate);
    };
  }, []);


  // Wallet balances removed for demo simplicity - not needed for core flow


  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">
        The Privacy Layer for Institutional Finance on Stellar
      </h1>
      <p className="text-xl text-gray-400 mb-8">
        Borrow against RWAs without revealing your position
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-900 rounded-lg p-6">
          <h3 className="text-sm text-gray-400 mb-2">Total Value Locked</h3>
          <p className="text-3xl font-bold">{tvl}</p>
          <p className="text-xs text-gray-500 mt-2">📡 Live from blockchain</p>
        </div>

        <div className="bg-blue-900 rounded-lg p-6">
          <h3 className="text-sm text-gray-400 mb-2">Active Loans</h3>
          <p className="text-3xl font-bold">{activeLoans}</p>
          <p className="text-xs text-gray-500 mt-2">📡 Live from blockchain</p>
        </div>

        <div className="bg-blue-900 rounded-lg p-6">
          <h3 className="text-sm text-gray-400 mb-2">Privacy Score</h3>
          <p className="text-3xl font-bold">{privacyScore}</p>
          <p className="text-xs text-gray-400 mt-1">
            Collateral amounts hidden via ZK proofs
          </p>
        </div>
      </div>

      {/* Wallet status */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Wallet</h3>
        {address ? (
          <>
            <p className="text-green-400 mb-2">✓ Connected</p>
            <p className="text-sm text-gray-400 font-mono mb-4">{address}</p>

            {walletBalances && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-700">
                <div className="bg-gray-700 rounded p-3">
                  <p className="text-xs text-gray-400">BENJI</p>
                  <p className="text-lg font-bold">{walletBalances.BENJI.toFixed(2)}</p>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <p className="text-xs text-gray-400">USDY</p>
                  <p className="text-lg font-bold">{walletBalances.USDY.toFixed(2)}</p>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <p className="text-xs text-gray-400">USDC</p>
                  <p className="text-lg font-bold">{walletBalances.USDC.toFixed(2)}</p>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <p className="text-xs text-gray-400">XLM</p>
                  <p className="text-lg font-bold">{walletBalances.XLM.toFixed(2)}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400">Not connected</p>
        )}
      </div>
    </div>
  );
}

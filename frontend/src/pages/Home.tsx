import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { server, NETWORK_PASSPHRASE } from "@/lib/stellar";
import { Contract } from "@stellar/stellar-sdk";

export default function Home() {
  const { address } = useWallet();
  const [tvl, setTvl] = useState<string>("Loading...");
  const [activeLoans, setActiveLoans] = useState<string>("Loading...");
  const [privacyScore] = useState<string>("97%"); // Can keep this as calculated metric

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch contracts config
        const contractsRes = await fetch("/contracts.json");
        const contracts = await contractsRes.json();

        // For now, show "0" until we have deposits
        setTvl("$0");
        setActiveLoans("0");
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setTvl("N/A");
        setActiveLoans("N/A");
      }
    };

    fetchStats();
  }, []);

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
        </div>

        <div className="bg-blue-900 rounded-lg p-6">
          <h3 className="text-sm text-gray-400 mb-2">Active Loans</h3>
          <p className="text-3xl font-bold">{activeLoans}</p>
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
            <p className="text-sm text-gray-400 font-mono">{address}</p>
          </>
        ) : (
          <p className="text-gray-400">Not connected</p>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";
import { generateDepositProof } from "../lib/api";
import { depositCollateral } from "../lib/contracts";
import { demoStore } from "../lib/demoStore";
import toast from "react-hot-toast";
import { OracleStatus } from '../components/OracleStatus';
import PrivacyIndicator from "../components/PrivacyIndicator";

import { AssetSelector } from '../components/AssetSelector';
import { ViewingKey } from '../components/ViewingKey';

export default function Deposit() {
  const { address } = useWallet();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [assetId, setAssetId] = useState(1); // Default to BENJI
  const [secret, setSecret] = useState("");
  const [secretSaved, setSecretSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [depositResult, setDepositResult] = useState<any>(null);

  const generateSecret = () => {
    const randomSecret = "0x" + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    setSecret(randomSecret);
    setSecretSaved(false);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success("Secret copied to clipboard!");
  };

  const handleDeposit = async () => {
    // 🧹 Cache Clear for Demo
    // @ts-ignore
    if (window.performance && performance.navigation.type === 1) {
      console.log('🔄 Clearing service worker cache...');
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(r => r.unregister());
        });
      }
    }

    console.log("Handle Deposit Clicked");
    console.log("State:", { address, amount, secret, secretSaved, loading, assetId });

    if (!address) {
      console.log("No address");
      toast.error("Please connect wallet first");
      return;
    }

    if (!amount || !secret) {
      console.log("Missing amount or secret");
      toast.error("Please enter amount and generate secret");
      return;
    }

    if (!secretSaved) {
      console.log("Secret not saved, prompting confirm");
      const confirmed = window.confirm(
        "⚠️ Have you saved your secret? You'll need it to borrow or withdraw. Continue?"
      );
      if (!confirmed) {
        console.log("User cancelled confirm");
        return;
      }
    }

    setLoading(true);
    console.log("Starting deposit flow...");

    try {
      // Generate ZK proof
      console.log("Calling generateDepositProof...", { amount, assetId });
      const proof = await generateDepositProof(
        parseFloat(amount),
        assetId,
        secret,
      );
      console.log("Proof generated:", proof);

      // Submit to blockchain
      console.log("Submitting transaction...");
      const depositId = await depositCollateral(
        address,
        assetId === 1 ? 'CB65HAVRSK326KH2QATYZPSCQUOKNDEQV5LQTC3QI4QSNUDRMAVEKKZE' : 'CDH3VTAOUN5C2Z2TTXBRB3IFGA2TOB5PKPHLDQROMDNSILJ5445G5WE6',
        proof.proof,
        proof.publicSignals
      );
      console.log("Transaction result:", depositId);

      toast.success(`✅ Deposit successful! ID: ${depositId.depositId}`);

      // Save to demo store for cross-page persistence
      const selectedAssetName = assetId === 1 ? 'BENJI' : assetId === 2 ? 'USDY' : 'USDC';
      demoStore.saveDeposit({
        depositId: depositId.depositId.toString(),
        user: address,
        asset: selectedAssetName,
        amount: parseFloat(amount),
        timestamp: Date.now(),
        txHash: depositId.txHash || 'demo-tx',
        status: 'active'
      });
      console.log('💾 Deposit saved to demo store');

      setDepositResult({
        depositId: depositId.depositId,
        secret: secret,
        amount: amount,
        assetId: assetId
      });

      setAmount("");
      setSecret("");
      setSecretSaved(false);

      // Auto-navigate to Borrow page after 3 seconds
      setTimeout(() => {
        toast.success('Redirecting to Borrow page...');
        navigate('/borrow');
      }, 3000);
    } catch (error: any) {
      console.error("Deposit error:", error);

      // Better error messages
      let errorMsg = "Deposit failed";
      if (error.message?.includes("map")) {
        errorMsg = "Contract data format error - check contracts.ts";
      } else if (error.message?.includes("Network") || error.message?.includes("fetch")) {
        errorMsg = "Oracle service offline - start proving-service";
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg, { id: 'deposit' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Deposit Collateral</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">

            {/* Asset Selector (NEW) */}
            <AssetSelector
              selectedAsset={assetId}
              onSelectAsset={setAssetId}
              disabled={loading}
            />

            {depositResult && (
              <div className="mb-6 animate-fade-in">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                  <h3 className="font-bold text-green-800">🎉 Deposit Complete!</h3>
                  <p className="text-sm text-green-700">Your assets are now shielded. Save your viewing key below.</p>
                </div>
                <ViewingKey
                  depositId={depositResult.depositId}
                  secret={depositResult.secret}
                  amount={depositResult.amount}
                  assetId={depositResult.assetId}
                />
                <button
                  onClick={() => setDepositResult(null)}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Make another deposit
                </button>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-2 bg-white text-gray-800">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000000"
                className="w-full px-4 py-2 border rounded-lg active:border-blue-500 focus:border-blue-500 bg-white text-gray-800"
                disabled={loading}
              />
            </div>

            {/* Secret Generator */}
            <div>
              <label className="block text-sm font-medium mb-2 bg-white text-gray-800">
                Your Secret Key
                <span className="text-red-500 ml-1">*SAVE THIS*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={generateSecret}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  disabled={loading}
                >
                  Generate Secret
                </button>
                {secret && (
                  <button
                    onClick={copySecret}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    📋 Copy
                  </button>
                )}
              </div>
              {secret && (
                <>
                  <div className="p-3 bg-red-50 border-2 border-red-500 rounded-lg font-mono text-sm break-all text-red-800">
                    {secret}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={secretSaved}
                      onChange={(e) => setSecretSaved(e.target.checked)}
                      id="secretCheck"
                    />
                    <label htmlFor="secretCheck" className="text-sm text-red-600 font-medium">
                      I have saved this secret (required to borrow/withdraw)
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Deposit Button */}
            <button
              onClick={handleDeposit}
              disabled={loading || !address || !secret}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Generating Proof..." : "Deposit Privately"}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <OracleStatus assetId={assetId} />

          <PrivacyIndicator
            hidden={["Collateral amount", "Your secret key"]}
            visible={["Commitment hash", "Asset type", "Deposit ID"]}
          />
        </div>
      </div>
    </div>
  );
}

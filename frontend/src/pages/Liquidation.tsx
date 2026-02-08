import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useWallet } from '../context/WalletContext';
import { liquidateLoan } from '../lib/contracts';

export default function Liquidation() {
  const { address: publicKey } = useWallet();
  const [loanId, setLoanId] = useState('');
  const [isLiquidating, setIsLiquidating] = useState(false);

  const handleLiquidate = async () => {
    if (!publicKey) {
      toast.error('Connect wallet');
      return;
    }

    if (!loanId) {
      toast.error('Enter loan ID');
      return;
    }

    try {
      setIsLiquidating(true);
      toast.loading('Liquidating loan via Stellar DEX...');

      const result = await liquidateLoan(publicKey, parseInt(loanId));

      toast.dismiss();
      toast.success('Loan liquidated successfully!');

      const txLink = `https://stellar.expert/explorer/testnet/tx/${result.txHash}`;
      toast.success(
        <div>
          View liquidation:{' '}
          <a href={txLink} target="_blank" className="underline">
            Transaction
          </a>
        </div>,
        { duration: 10000 },
      );

    } catch (error: any) {
      toast.error(`Liquidation failed: ${error.message}`);
    } finally {
      setIsLiquidating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Liquidation Demo</h1>

      <div className="bg-red-900 p-6 rounded-lg">
        <p className="mb-4">
          This page demonstrates private liquidation. When a loan becomes
          undercollateralized, it can be liquidated via Stellar DEX without
          revealing the original collateral amount publicly.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Loan ID to Liquidate</label>
            <input
              type="number"
              value={loanId}
              onChange={(e) => setLoanId(e.target.value)}
              placeholder="1"
              className="w-full px-4 py-2 bg-gray-700 rounded"
            />
          </div>

          <button
            onClick={handleLiquidate}
            disabled={isLiquidating || !publicKey}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-semibold"
          >
            {isLiquidating ? 'Liquidating...' : 'Trigger Liquidation'}
          </button>
        </div>
      </div>
    </div>
  );
}

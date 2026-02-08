import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useWallet } from '../context/WalletContext';
import { getLoanStatus, repayLoan } from '../lib/contracts';

export default function Manage() {
  const { address: publicKey } = useWallet();
  const [loanId, setLoanId] = useState('');
  const [loanStatus, setLoanStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckStatus = async () => {
    if (!loanId) {
      toast.error('Enter a loan ID');
      return;
    }

    try {
      setIsLoading(true);
      const status = await getLoanStatus(parseInt(loanId));
      setLoanStatus(status);
      toast.success(`Loan status: ${status}`);
    } catch (error: any) {
      toast.error(`Failed to fetch status: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!publicKey || !loanId) {
      toast.error('Connect wallet and enter loan ID');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Repaying loan...');

      const result = await repayLoan(publicKey, parseInt(loanId));

      toast.dismiss();
      toast.success('Loan repaid successfully!');

      setLoanStatus('Repaid');
    } catch (error: any) {
      toast.error(`Repayment failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Loans</h1>

      <div className="bg-gray-800 p-6 rounded-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Loan ID</label>
          <input
            type="number"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            placeholder="1"
            className="w-full px-4 py-2 bg-gray-700 rounded"
          />
        </div>

        <button
          onClick={handleCheckStatus}
          disabled={isLoading}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded"
        >
          Check Status
        </button>

        {loanStatus && (
          <div className="p-4 bg-blue-900 rounded">
            <p>Status: <span className="font-bold">{loanStatus}</span></p>
          </div>
        )}

        <button
          onClick={handleRepay}
          disabled={isLoading || !publicKey}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-semibold"
        >
          {isLoading ? 'Processing...' : 'Repay Loan'}
        </button>
      </div>
    </div>
  );
}

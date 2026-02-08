import { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { liquidateLoan } from '../lib/contracts';
import toast from 'react-hot-toast';

export default function Liquidation() {
  const { address } = useWallet();
  const [liquidatableLoans, setLiquidatableLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadLiquidatableLoans();
  }, []);

  const loadLiquidatableLoans = async () => {
    try {
      setLoading(true);
      setError("");

      console.log('📋 Loading liquidatable loans...');

      // TODO: Implement liquidation queries using blockchain events
      // Query for loans with health factor < 100%
      // const loans = await getLiquidatableLoans();
      // setLiquidatableLoans(loans);

      // For now, show empty state
      setLiquidatableLoans([]);
      console.log('⚠️ Liquidation queries not yet implemented - requires event parsing and health factor calculation');

    } catch (error: any) {
      console.error('Failed to load liquidatable loans:', error);
      setError('Failed to load liquidation data from blockchain');
    } finally {
      setLoading(false);
    }
  };

  const handleLiquidate = async (loanId: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      console.log('⚡ Liquidating loan:', loanId);

      const result = await liquidateLoan(address, Number(loanId));

      console.log('✅ Liquidation successful:', result);
      toast.success(`Liquidation successful! Tx: ${result.txHash || 'success'}`);

      // Reload
      loadLiquidatableLoans();

    } catch (error: any) {
      console.error('❌ Liquidation failed:', error);
      toast.error(`Liquidation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && liquidatableLoans.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Liquidation Dashboard</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Loading liquidation data from blockchain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Liquidation Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={loadLiquidatableLoans}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Liquidation Dashboard</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800">
          Monitor and liquidate under-collateralized loans (health factor &lt; 100%)
        </p>
      </div>

      {liquidatableLoans.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold text-green-600 mb-4">
            ✅ No loans available for liquidation
          </h3>
          <p className="text-gray-600 mb-4">
            No under-collateralized loans found on the blockchain
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Liquidation queries require parsing blockchain events and calculating health factors.
            This feature is not yet implemented.
          </p>

          <button
            onClick={loadLiquidatableLoans}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            🔄 Refresh
          </button>
        </div>
      ) : (
        <>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">
              ⚠️ {liquidatableLoans.length} loan(s) available for liquidation
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Loan ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Borrower
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Health Factor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Loan Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {liquidatableLoans.map((loan) => (
                  <tr key={loan.id} className="bg-red-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {loan.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {loan.user.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      {loan.healthFactor}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {loan.amount} USDC
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleLiquidate(loan.id)}
                        disabled={loading}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
                      >
                        ⚡ Liquidate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { demoStore, DemoLoan } from '../lib/demoStore';
import { liquidateLoan } from '../lib/contracts';
import toast from 'react-hot-toast';

export default function Liquidation() {
  const { address } = useWallet();
  const [liquidatableLoans, setLiquidatableLoans] = useState<DemoLoan[]>([]);
  const [allLoans, setAllLoans] = useState<DemoLoan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🔍 Liquidation page mounted');
    loadLiquidatableLoans();

    const handleUpdate = () => {
      console.log('🔄 Loans updated, reloading liquidation list...');
      loadLiquidatableLoans();
    };

    demoStore.subscribe('loans', handleUpdate);

    return () => {
      demoStore.unsubscribe('loans', handleUpdate);
    };
  }, []);

  const loadLiquidatableLoans = () => {
    console.log('📋 Loading all loans for liquidation check...');

    // Direct localStorage read
    const rawData = localStorage.getItem('demo_loans');
    console.log('Raw loan data:', rawData);

    if (rawData) {
      const loans: DemoLoan[] = JSON.parse(rawData);
      console.log('All loans:', loans);

      // Filter for liquidatable (active + health < 100)
      const liquidatable = loans.filter(
        loan => loan.status === 'active' && loan.healthFactor < 100
      );

      console.log('Liquidatable loans:', liquidatable);

      setAllLoans(loans);
      setLiquidatableLoans(liquidatable);
    } else {
      console.log('📭 No loans in storage');
      setAllLoans([]);
      setLiquidatableLoans([]);
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

      // Call contract
      const result = await liquidateLoan(address, Number(loanId));

      console.log('✅ Liquidation successful:', result);

      // Update demo store
      demoStore.updateLoanStatus(loanId, 'liquidated');

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

  const simulatePriceDrop = (loanId: string) => {
    // For demo: artificially reduce health factor
    console.log('📉 Simulating price drop for loan:', loanId);
    demoStore.updateLoanHealth(loanId, 85); // Drop to 85%
    loadLiquidatableLoans();
    toast.success('Price dropped! Loan health is now 85%');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Liquidation Dashboard</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800">Monitor and liquidate under-collateralized loans (health factor &lt; 100%)</p>
      </div>

      {liquidatableLoans.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold text-green-600 mb-4">✅ No loans available for liquidation</h3>
          <p className="text-gray-600 mb-6">All active loans are properly collateralized</p>

          {allLoans.filter(l => l.status === 'active').length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">
                Healthy Loans ({allLoans.filter(l => l.status === 'active').length})
              </h4>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Loan ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Health</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Demo Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allLoans.filter(l => l.status === 'active').map(loan => (
                      <tr key={loan.loanId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {loan.loanId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {loan.healthFactor}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {loan.status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => simulatePriceDrop(loan.loanId)}
                            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                          >
                            📉 Simulate Price Drop
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            onClick={loadLiquidatableLoans}
            className="mt-6 bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Loan ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Borrower</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Health Factor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Loan Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Collateral</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {liquidatableLoans.map(loan => (
                  <tr key={loan.loanId} className="bg-red-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {loan.loanId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {loan.user.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      {loan.healthFactor}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {loan.loanAmount} {loan.loanAsset}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {loan.collateralAmount} {loan.collateralAsset}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleLiquidate(loan.loanId)}
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

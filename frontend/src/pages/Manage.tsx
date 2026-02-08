import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { demoStore, DemoLoan } from '../lib/demoStore';
import { repayLoan } from '../lib/contracts';
import toast from 'react-hot-toast';

export default function Manage() {
  const { address } = useWallet();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<DemoLoan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🔍 Manage page mounted');
    console.log('Wallet:', address);

    if (address) {
      loadUserLoans();
    }

    // Subscribe to updates
    const handleUpdate = () => {
      console.log('🔄 Loans updated, reloading...');
      loadUserLoans();
    };

    demoStore.subscribe('loans', handleUpdate);

    return () => {
      demoStore.unsubscribe('loans', handleUpdate);
    };
  }, [address]);

  const loadUserLoans = () => {
    if (!address) return;

    console.log('📋 Loading loans for:', address);

    // Direct localStorage read for debugging
    const rawData = localStorage.getItem('demo_loans');
    console.log('Raw localStorage data:', rawData);

    if (rawData) {
      const allLoans = JSON.parse(rawData);
      console.log('All loans in storage:', allLoans);

      // Filter for current user (case-insensitive match)
      const userLoans = allLoans.filter((loan: any) =>
        loan.user && loan.user.toLowerCase() === address.toLowerCase()
      );

      console.log('User loans found:', userLoans);
      setLoans(userLoans);

      if (userLoans.length === 0) {
        console.warn('⚠️ No loans found for user');
        console.log('Checking user addresses:');
        allLoans.forEach((loan: any, i: number) => {
          console.log(`  Loan ${i}: ${loan.user}`);
        });
        console.log(`  Your address: ${address}`);
      }
    } else {
      console.log('📭 No loans in localStorage');
      setLoans([]);
    }
  };

  const handleRepay = async (loanId: string) => {
    try {
      setLoading(true);
      console.log('💰 Repaying loan:', loanId);

      // Call contract
      const result = await repayLoan(address, Number(loanId));

      console.log('✅ Repayment successful:', result);

      // Update demo store
      demoStore.updateLoanStatus(loanId, 'repaid');

      // Release collateral
      const loan = demoStore.getLoanById(loanId);
      if (loan) {
        demoStore.updateDepositStatus(loan.depositId, 'active');
      }

      toast.success(`Loan repaid! Tx: ${result.txHash || 'success'}`);

      // Reload loans
      loadUserLoans();

    } catch (error: any) {
      console.error('❌ Repayment failed:', error);
      toast.error(`Repayment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Manage Your Loans</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">Please connect your wallet to view your loans</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Your Loans</h1>

      {loans.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No loans found</h3>
          <p className="text-gray-600 mb-4">Make a deposit and borrow to see your loans here</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/borrow')}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Borrow Now
            </button>
            <button
              onClick={loadUserLoans}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Debug button */}
          <button
            onClick={() => {
              console.log('=== DEBUG DATA ===');
              console.log('Deposits:', JSON.parse(localStorage.getItem('demo_deposits') || '[]'));
              console.log('Loans:', JSON.parse(localStorage.getItem('demo_loans') || '[]'));
              console.log('Current user:', address);
            }}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            🐛 Debug Data
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
            <p className="text-gray-700">You have <strong>{loans.length}</strong> loan(s)</p>
            <button
              onClick={loadUserLoans}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Loan ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Collateral</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Borrowed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Health Factor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map(loan => (
                  <tr key={loan.loanId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {loan.loanId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {loan.collateralAmount} {loan.collateralAsset}
                      <br />
                      <small className="text-gray-500">Deposit #{loan.depositId}</small>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {loan.loanAmount} {loan.loanAsset}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-semibold ${loan.healthFactor >= 150 ? 'text-green-600' :
                          loan.healthFactor >= 100 ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>
                        {loan.healthFactor}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${loan.status === 'active' ? 'bg-green-100 text-green-800' :
                          loan.status === 'repaid' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {loan.status === 'active' && (
                        <button
                          onClick={() => handleRepay(loan.loanId)}
                          disabled={loading}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                        >
                          Repay Loan
                        </button>
                      )}
                      {loan.status === 'repaid' && (
                        <span className="text-gray-500">Completed</span>
                      )}
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

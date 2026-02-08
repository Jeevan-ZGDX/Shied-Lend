import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { repayLoan } from '../lib/contracts';
import toast from 'react-hot-toast';

interface Loan {
  id: string;
  user: string;
  amount: number;
  status: string;
  timestamp: number;
  txHash: string;
}

export default function Manage() {
  const { address } = useWallet();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (address) {
      loadUserLoans();
    }
  }, [address]);

  const loadUserLoans = async () => {
    try {
      setLoading(true);
      setError("");

      console.log('📋 Loading loans for user:', address);

      // TODO: Implement getUserLoans() using blockchain events
      // const userLoans = await getUserLoans(address);
      // setLoans(userLoans);

      // For now, show empty state
      setLoans([]);
      console.log('⚠️ Loan queries not yet implemented - requires event parsing');

    } catch (error: any) {
      console.error('Failed to load loans:', error);
      setError('Failed to load loans from blockchain');
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async (loanId: string) => {
    if (!address) return;

    try {
      setLoading(true);
      console.log('💰 Repaying loan:', loanId);

      const result = await repayLoan(address, Number(loanId));

      console.log('✅ Repayment successful:', result);
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

  if (loading && loans.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Manage Your Loans</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Loading loans from blockchain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Manage Your Loans</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={loadUserLoans}
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
      <h1 className="text-3xl font-bold mb-6">Manage Your Loans</h1>

      {loans.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No loans found</h3>
          <p className="text-gray-600 mb-4">
            No active loans found on the blockchain for your address
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Loan queries require parsing blockchain events. This feature is not yet implemented.
          </p>
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
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
            <p className="text-gray-700">
              You have <strong>{loans.length}</strong> loan(s)
            </p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Loan ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {loan.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {loan.amount} USDC
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${loan.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : loan.status === 'repaid'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {loan.status === 'active' && (
                        <button
                          onClick={() => handleRepay(loan.id)}
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

import { useState, useEffect } from 'react';
import axios from 'axios';

// API Base URL from env or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function KYCStatus({ userAddress }: { userAddress: string }) {
    const [status, setStatus] = useState<'checking' | 'approved' | 'rejected'>('checking');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function checkKYC() {
            try {
                const response = await axios.post(`${API_BASE_URL}/check-kyc`, {
                    user_address: userAddress
                });

                if (mounted) {
                    setStatus(response.data.approved ? 'approved' : 'rejected');
                }
            } catch (err: any) {
                console.error("KYC check failed:", err);
                if (mounted) {
                    setStatus('rejected');
                    setError(err.response?.data?.message || err.message);
                }
            }
        }

        if (userAddress) {
            checkKYC();
        } else {
            setStatus('checking'); // Or 'rejected' if no address
        }

        return () => { mounted = false; };
    }, [userAddress]);

    if (!userAddress) return null;

    if (status === 'checking') return <span className="text-gray-500 text-sm">🔄 Checking KYC...</span>;

    if (status === 'approved') return (
        <span className="text-green-600 font-medium text-sm flex items-center gap-1">
            ✅ KYC Approved
        </span>
    );

    return (
        <span className="text-red-500 font-medium text-sm flex items-center gap-1" title={error || "Not authorized"}>
            ❌ KYC Required
        </span>
    );
}

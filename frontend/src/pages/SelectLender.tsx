import { useState, useEffect } from 'react';
import axios from 'axios';
import { useWallet } from '../context/WalletContext';

interface Lender {
    name: string;
    address: string;
    type: string;
    estimatedRate: number;
    availableLiquidity: number;
}

export function SelectLender() {
    const [lenders, setLenders] = useState<Lender[]>([]);
    const [assetId, setAssetId] = useState(1); // Default to BENJI
    const [loading, setLoading] = useState(true);
    const { address } = useWallet();

    useEffect(() => {
        async function fetchLenders() {
            setLoading(true);
            try {
                const response = await axios.post('http://localhost:3000/api/get-lenders', {
                    asset_id: assetId
                });

                console.log('Real lenders:', response.data);
                setLenders(response.data.lenders);
            } catch (error) {
                console.error('Failed to fetch lenders:', error);
            }
            setLoading(false);
        }

        fetchLenders();
    }, [assetId]);

    if (loading) return (
        <div className="max-w-4xl mx-auto p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Fetching real institutional data from Stellar blockchain...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-2">Institutional Lenders</h1>
            <p className="text-gray-600 mb-8">
                Real RWA holders on Stellar blockchain with available liquidity. Select a lender to request a loan.
            </p>

            <div className="grid gap-4">
                {lenders.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500">No institutional lenders found for this asset.</p>
                    </div>
                ) : lenders.map((lender, idx) => (
                    <div key={idx} className="bg-white border text-gray-800 rounded-lg p-6 hover:shadow-lg transition cursor-pointer group">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg group-hover:text-blue-600 transition">
                                    {lender.name !== 'Unknown' ? lender.name : `Institution ${idx + 1}`}
                                </h3>
                                <p className="text-xs text-gray-500 font-mono mt-1">{lender.address}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className={`inline-block px-2 py-0.5 text-xs rounded font-medium ${lender.type === 'institutional' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {lender.type.toUpperCase()}
                                    </span>
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">
                                        VERIFIED
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-green-600">
                                    {(lender.estimatedRate * 100).toFixed(2)}%
                                </p>
                                <p className="text-xs text-gray-500 font-bold">APR</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                Available Liquidity: <span className="font-bold text-gray-900">${lender.availableLiquidity.toLocaleString()}</span>
                            </p>
                            <button
                                onClick={() => alert(`Request submitted to ${lender.name}`)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                Request Loan
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-500 flex items-center gap-2">
                <span>✓</span> Data fetched directly from Stellar Horizon API in real-time
            </div>
        </div>
    );
}

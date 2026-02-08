import { useState } from 'react';
import toast from 'react-hot-toast';

interface ViewingKeyProps {
    depositId: string;
    secret: string;
    amount: string;
    assetId: number;
}

export function ViewingKey({ depositId, secret, amount, assetId }: ViewingKeyProps) {
    const [showKey, setShowKey] = useState(false);

    const viewingKeyData = JSON.stringify({
        type: "ShieldLend_Viewing_Key",
        version: "1.0",
        data: {
            depositId,
            secret,
            amount,
            assetId,
            timestamp: Date.now()
        }
    }, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(viewingKeyData);
        toast.success("Viewing key copied to clipboard!");
    };

    const handleDownload = () => {
        const blob = new Blob([viewingKeyData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shieldlend-key-${depositId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Viewing key downloaded!");
    };

    if (!depositId) return null;

    return (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                🔑 Viewing Key
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                Share this key with auditors or regulators to prove your asset backing without revealing it on-chain.
            </p>

            {!showKey ? (
                <button
                    onClick={() => setShowKey(true)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                    Reveal Viewing Key
                </button>
            ) : (
                <div className="space-y-3">
                    <textarea
                        readOnly
                        value={viewingKeyData}
                        className="w-full h-32 p-3 font-mono text-xs bg-gray-900 text-green-400 rounded border border-gray-700 focus:outline-none"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Copy to Clipboard
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Download JSON
                        </button>
                    </div>
                    <button
                        onClick={() => setShowKey(false)}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Hide Key
                    </button>
                </div>
            )}
        </div>
    );
}

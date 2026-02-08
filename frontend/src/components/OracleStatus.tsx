import { useState, useEffect } from 'react';

interface OracleStatusProps {
  assetId?: number;
}

export function OracleStatus({ assetId = 1 }: OracleStatusProps) {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    let retries = 0;
    const maxRetries = 3;

    const fetchPrice = async () => {
      try {
        console.log('Fetching oracle price for asset', assetId);

        const response = await fetch('http://localhost:3000/api/get-oracle-price', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ asset_id: assetId }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Oracle response:', data);

        if (mounted) {
          setPrice(data.price_usd || data.price); // Handle both formats
          setStatus('online');
          setError('');
          retries = 0;
        }
      } catch (err: any) {
        console.error('Oracle fetch error:', err);

        if (mounted) {
          if (retries < maxRetries) {
            retries++;
            console.log(`Retrying... (${retries}/${maxRetries})`);
            setTimeout(fetchPrice, 2000);
          } else {
            setStatus('offline');
            setError(err.message || 'Connection failed');
          }
        }
      }
    };

    fetchPrice();

    // Refresh every 10 seconds
    const interval = setInterval(fetchPrice, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [assetId]);

  if (status === 'loading') {
    return (
      <div className="oracle-status">
        <span className="text-blue-600">🔄 Connecting to oracle...</span>
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div className="oracle-status p-4 border rounded-lg bg-red-50 border-red-200">
        <span className="text-red-600 font-bold">❌ Oracle Offline</span>
        <p className="text-xs text-red-500 mt-1">{error}</p>
        <p className="text-xs text-gray-500">
          Check: Is oracle running on port 3000?
        </p>
      </div>
    );
  }

  if (status === 'online') {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-700 font-semibold">✅ Oracle Online</span>
          <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-full">
            REAL DATA
          </span>
        </div>

        {price !== null && (
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="text-3xl font-bold text-gray-900">
                ${price.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    );
  }

  return null; // Fallback
}

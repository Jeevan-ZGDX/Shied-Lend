import { useState, useEffect } from 'react';
import { getOraclePrice } from '../lib/api';

export function OracleStatusEnhanced({ assetId = 1 }) {
    const [status, setStatus] = useState('connecting');
    const [price, setPrice] = useState<number | null>(null);
    const [retries, setRetries] = useState(0);

    useEffect(() => {
        let mounted = true;

        const fetchPrice = async () => {
            try {
                const data = await getOraclePrice(assetId);
                if (mounted) {
                    setStatus('online');
                    setPrice(data.price_usd);
                    setRetries(0);
                }
            } catch (error) {
                console.error('Oracle fetch error:', error);
                if (mounted) {
                    if (retries < 3) {
                        setStatus('retrying');
                        setTimeout(() => {
                            if (mounted) {
                                setRetries(r => r + 1);
                            }
                        }, 2000);
                    } else {
                        setStatus('offline');
                    }
                }
            }
        };

        if (status === 'connecting' || status === 'retrying') {
            fetchPrice();
        }

        // Refresh every 10s if online
        let interval: NodeJS.Timeout;
        if (status === 'online') {
            interval = setInterval(fetchPrice, 10000);
        }

        return () => {
            mounted = false;
            if (interval) clearInterval(interval);
        };
    }, [assetId, retries, status]);

    return (
        <div className={`oracle-status p-2 rounded text-sm flex items-center gap-2 ${status === 'online' ? 'bg-green-100 text-green-800' :
                status === 'offline' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
            }`}>
            {status === 'connecting' && <span>🔄 Connecting...</span>}
            {status === 'retrying' && <span>⏳ Retrying ({retries}/3)...</span>}
            {status === 'online' && <span>✅ Oracle Online - ${price}</span>}
            {status === 'offline' && <span>❌ Oracle Offline (Check port 3000)</span>}
        </div>
    );
}

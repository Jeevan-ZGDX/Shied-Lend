import { RWA_ASSETS } from '../config/assets';

interface AssetSelectorProps {
    selectedAsset: number;
    onSelectAsset: (assetId: number) => void;
    disabled?: boolean;
}

export function AssetSelector({ selectedAsset, onSelectAsset, disabled }: AssetSelectorProps) {
    return (
        <div className="asset-selector mb-4">
            <label className="block text-sm font-medium mb-2 bg-white text-gray-800">
                Select Collateral Asset
            </label>
            <select
                value={selectedAsset}
                onChange={(e) => onSelectAsset(Number(e.target.value))}
                className="w-full p-3 border rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500"
                disabled={disabled}
            >
                {RWA_ASSETS.map(asset => (
                    <option key={asset.id} value={asset.id} className="text-gray-800">
                        {asset.symbol} - {asset.name}
                    </option>
                ))}
            </select>

            {/* Show selected asset details */}
            {RWA_ASSETS.find(a => a.id === selectedAsset) && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded text-sm">
                    <p className="font-medium text-blue-900">
                        {RWA_ASSETS.find(a => a.id === selectedAsset)?.description}
                    </p>
                    <p className="text-blue-700 mt-1">
                        Min. Collateral: ${RWA_ASSETS.find(a => a.id === selectedAsset)?.minCollateral.toLocaleString()}
                    </p>
                </div>
            )}
        </div>
    );
}

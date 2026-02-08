import React from 'react';

interface PrivacyIndicatorProps {
  hidden: string[];
  visible: string[];
}

export default function PrivacyIndicator({ hidden, visible }: PrivacyIndicatorProps) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
        🔒 Privacy Status
      </h3>

      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-600 mb-1">
            Hidden (Zero-Knowledge):
          </div>
          <div className="space-y-1">
            {hidden.map((item, i) => (
              <div key={i} className="text-sm flex items-center gap-2">
                <span className="text-red-500">🔒</span>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-gray-600 mb-1">
            Public (On-Chain):
          </div>
          <div className="space-y-1">
            {visible.map((item, i) => (
              <div key={i} className="text-sm flex items-center gap-2">
                <span className="text-green-500">👁️</span>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-purple-200">
        <p className="text-xs text-gray-600">
          ✓ Collateral amounts stay private via commitments
          <br />
          ✓ Only you can prove ownership with your secret
        </p>
      </div>
    </div>
  );
}

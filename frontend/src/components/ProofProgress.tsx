import React from 'react';

interface Step {
  label: string;
  status: "pending" | "active" | "complete" | "error";
}

interface ProofProgressProps {
  steps: Step[];
}

export default function ProofProgress({ steps }: ProofProgressProps) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-3">Proof Generation Progress</h3>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            {step.status === "complete" && (
              <span className="text-green-500 text-lg">✓</span>
            )}
            {step.status === "active" && (
              <span className="text-blue-500 text-lg animate-spin">⏳</span>
            )}
            {step.status === "pending" && (
              <span className="text-gray-300 text-lg">○</span>
            )}
            {step.status === "error" && (
              <span className="text-red-500 text-lg">✗</span>
            )}
            <span
              className={`text-sm ${step.status === "active"
                  ? "font-semibold text-blue-600"
                  : step.status === "complete"
                    ? "text-green-600"
                    : step.status === "error"
                      ? "text-red-600"
                      : "text-gray-400"
                }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

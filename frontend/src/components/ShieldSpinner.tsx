export default function ShieldSpinner({ label = 'Generating Zero-Knowledge Proof...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-stellar-blue animate-pulseShield" />
      <div className="text-sm text-gray-300">{label}</div>
    </div>
  )
}

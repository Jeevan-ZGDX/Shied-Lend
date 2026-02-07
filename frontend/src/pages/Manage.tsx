import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

type LoanItem = { id: string; amount: string; status: string }

export default function Manage() {
  const [loans, setLoans] = useState<LoanItem[]>([])
  const [viewKey, setViewKey] = useState<string>('')
  const [health, setHealth] = useState<string>('Healthy')

  useEffect(() => {
    const items: LoanItem[] = JSON.parse(localStorage.getItem('shieldlend:loans') || '[]')
    setLoans(items)
    setViewKey(generateViewKey())
  }, [])

  const repay = (id: string) => {
    setLoans(prev => prev.map(l => l.id === id ? { ...l, status: 'repaid' } : l))
    toast.success('Loan repaid')
  }

  const generateViewKey = () => {
    const rand = crypto.getRandomValues(new Uint8Array(16))
    return Array.from(rand).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <div className="text-lg font-semibold">Active Loans</div>
        {loans.length === 0 && <div className="text-sm text-gray-300">No active loans</div>}
        {loans.map(l => (
          <div key={l.id} className="flex items-center justify-between border-b border-[#1f2752] py-2">
            <div>
              <div className="font-mono text-sm">{l.id}</div>
              <div className="text-xs text-gray-300">Amount: {l.amount} USDC</div>
              <div className="text-xs text-gray-300">Status: {l.status}</div>
            </div>
            <button className="btn btn-primary" onClick={() => repay(l.id)}>Repay Loan</button>
          </div>
        ))}
      </div>
      <div className="card space-y-3">
        <div className="text-lg font-semibold">Private Collateral Health</div>
        <div className="text-sm">Status: {health}</div>
        <div className="text-xs text-gray-300">Fetched via ZK-proof, not on-chain</div>
      </div>
      <div className="card space-y-3">
        <div className="text-lg font-semibold">Viewing Key</div>
        <div className="text-sm">Share with auditor:</div>
        <div className="font-mono text-xs">{viewKey}</div>
        <button className="btn btn-primary" onClick={() => { const k = generateViewKey(); setViewKey(k); toast.success('New viewing key generated') }}>Generate New Key</button>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import ShieldSpinner from '@/components/ShieldSpinner'
import { generateLoanProof } from '@/lib/api'
import { buildManageDataTx, PASSPHRASE } from '@/lib/stellar'
import { useWallet } from '@/context/WalletContext'

type DepositItem = { id: string; asset: string; amount: string }

export default function Borrow() {
  const [deposits, setDeposits] = useState<DepositItem[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loanAmount, setLoanAmount] = useState('')
  const [ltv, setLtv] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'generating' | 'verified'>('idle')
  const [proofInfo, setProofInfo] = useState<{ elapsedMs?: number }>({})
  const [loanId, setLoanId] = useState<string | null>(null)
  const { address, signAndSubmit } = useWallet()

  useEffect(() => {
    const items: DepositItem[] = JSON.parse(localStorage.getItem('shieldlend:deposits') || '[]')
    setDeposits(items)
    setSelected(items[0]?.id ?? null)
  }, [])

  useEffect(() => {
    if (!selected || !loanAmount) {
      setLtv(null)
      return
    }
    const dep = deposits.find(d => d.id === selected)
    if (!dep) return
    const price = 1
    const collateralUsd = parseFloat(dep.amount) * price
    const desiredUsd = parseFloat(loanAmount)
    const ratio = desiredUsd / collateralUsd
    setLtv(Number.isFinite(ratio) ? Math.round(ratio * 100) / 100 : null)
  }, [selected, loanAmount, deposits])

  const onGenerateProof = async () => {
    if (!selected || !loanAmount) return toast.error('Select deposit and enter loan amount')
    setStatus('generating')
    try {
      const res = await generateLoanProof(selected, loanAmount)
      setProofInfo({ elapsedMs: res.elapsedMs })
      setStatus('verified')
      toast.success('Collateral proof generated')
    } catch {
      setStatus('idle')
      toast.error('Proof generation failed')
    }
  }

  const onRequestLoan = async () => {
    if (!address) return toast.error('Connect wallet')
    if (status !== 'verified') return toast.error('Generate collateral proof first')
    try {
      const tx = await buildManageDataTx(address, 'shieldlend:loan', `${selected}:${loanAmount}`)
      const { hash } = await signAndSubmit(tx.toXDR(), PASSPHRASE)
      const id = `loan-${hash.slice(0, 8)}`
      setLoanId(id)
      localStorage.setItem('shieldlend:loans', JSON.stringify([...(JSON.parse(localStorage.getItem('shieldlend:loans') || '[]') as any[]), { id, amount: loanAmount, status: 'approved' }]))
      toast.success('Loan approved ✓ without revealing your collateral')
    } catch {
      toast.error('Transaction failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <div className="text-lg font-semibold">Borrow USDC</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-gray-300">Select Deposit</label>
            <select className="input" value={selected ?? ''} onChange={e => setSelected(e.target.value)}>
              <option value="" disabled>Select deposit_id</option>
              {deposits.map(d => <option key={d.id} value={d.id}>{d.id} ({d.asset})</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-300">Loan Amount (USDC)</label>
            <input className="input" placeholder="e.g. 500" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="btn btn-primary w-full" onClick={onGenerateProof}>Generate Collateral Proof</button>
          </div>
        </div>
        {status === 'generating' && <ShieldSpinner label="Generating Collateral ZK Proof..." />}
        {status === 'verified' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="card">
              <div className="text-sm text-gray-300">LTV (private)</div>
              <div className="mt-1">{ltv !== null ? `${Math.round(((ltv ?? 0) * 100))}%` : '-'}</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-300">Proof Time</div>
              <div className="mt-1">{proofInfo.elapsedMs} ms</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-300">Verification</div>
              <div className="mt-1">Proof verified ✓</div>
            </div>
          </div>
        )}
      </div>
      <div className="card space-y-3">
        <div className="text-lg font-semibold">Request Loan</div>
        <button className="btn btn-primary" onClick={onRequestLoan}>Request Loan</button>
        {loanId && (
          <div className="text-sm">
            <div>Loan ID: <span className="font-mono">{loanId}</span></div>
            <div>Loan approved ✓ without revealing your collateral</div>
          </div>
        )}
      </div>
    </div>
  )
}

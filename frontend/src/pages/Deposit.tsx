import { useState } from 'react'
import toast from 'react-hot-toast'
import ShieldSpinner from '@/components/ShieldSpinner'
import { generateDepositProof } from '@/lib/api'
import { buildManageDataTx, PASSPHRASE } from '@/lib/stellar'
import { useWallet } from '@/context/WalletContext'

const RWA_OPTIONS = [
  'Franklin Templeton Benji',
  'Tokenized Treasury',
  'Tokenized Corporate Bond'
]

export default function Deposit() {
  const [asset, setAsset] = useState(RWA_OPTIONS[0])
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<'idle' | 'generating' | 'verified'>('idle')
  const [proofInfo, setProofInfo] = useState<{ nullifier?: string; elapsedMs?: number }>({})
  const [txHash, setTxHash] = useState<string | null>(null)
  const [depositId, setDepositId] = useState<string | null>(null)
  const { address, signAndSubmit } = useWallet()

  const onGenerateProof = async () => {
    if (!amount) return toast.error('Enter collateral amount')
    setStatus('generating')
    try {
      const res = await generateDepositProof(asset, amount)
      setProofInfo({ nullifier: res.nullifierCommitment, elapsedMs: res.elapsedMs })
      setStatus('verified')
      toast.success('Proof verified')
    } catch (e: any) {
      setStatus('idle')
      toast.error(`Proof generation failed`)
    }
  }

  const onDeposit = async () => {
    if (!address) return toast.error('Connect wallet')
    if (!proofInfo.nullifier) return toast.error('Generate proof first')
    try {
      const tx = await buildManageDataTx(address, 'shieldlend:deposit', proofInfo.nullifier)
      const { hash } = await signAndSubmit(tx.toXDR(), PASSPHRASE)
      setTxHash(hash)
      const id = `dep-${hash.slice(0, 8)}`
      setDepositId(id)
      localStorage.setItem('shieldlend:deposits', JSON.stringify([...(JSON.parse(localStorage.getItem('shieldlend:deposits') || '[]') as any[]), { id, asset, amount }]))
      toast.success('Deposited to Vault')
    } catch (e: any) {
      toast.error('Transaction failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <div className="text-lg font-semibold">Deposit Collateral</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-gray-300">RWA Asset</label>
            <select className="input" value={asset} onChange={e => setAsset(e.target.value)}>
              {RWA_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-300">Collateral Amount</label>
            <input className="input" placeholder="e.g. 1000" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="btn btn-primary w-full" onClick={onGenerateProof}>Generate Privacy Proof</button>
          </div>
        </div>
        {status === 'generating' && <ShieldSpinner />}
        {status === 'verified' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="card">
              <div className="text-sm text-gray-300">Proof Status</div>
              <div className="mt-1">Proof verified ✓</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-300">Nullifier Commitment</div>
              <div className="mt-1 font-mono text-xs">{proofInfo.nullifier}</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-300">Generation Time</div>
              <div className="mt-1">{proofInfo.elapsedMs} ms</div>
            </div>
          </div>
        )}
      </div>
      <div className="card space-y-3">
        <div className="text-lg font-semibold">Deposit to Vault</div>
        <button className="btn btn-primary" onClick={onDeposit}>Deposit to Vault</button>
        {txHash && (
          <div className="text-sm">
            <div>Transaction Hash: <span className="font-mono">{txHash}</span></div>
            <div>Deposit ID: <span className="font-mono">{depositId}</span></div>
          </div>
        )}
      </div>
    </div>
  )
}

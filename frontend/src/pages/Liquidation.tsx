import { useState } from 'react'
import toast from 'react-hot-toast'
import { simulatePathPayment, PASSPHRASE } from '@/lib/stellar'
import { useWallet } from '@/context/WalletContext'

export default function Liquidation() {
  const { address, signAndSubmit } = useWallet()
  const [hash, setHash] = useState<string | null>(null)

  const onLiquidate = async () => {
    if (!address) return toast.error('Connect wallet')
    try {
      const tx = await simulatePathPayment(address, '1')
      const { hash } = await signAndSubmit(tx.toXDR(), PASSPHRASE)
      setHash(hash)
      toast.success('Liquidation triggered')
    } catch {
      toast.error('Liquidation failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <div className="text-lg font-semibold">Liquidation Demo</div>
        <div className="text-sm text-gray-300">Simulated undercollateralized loan</div>
        <button className="btn btn-primary" onClick={onLiquidate}>Trigger Liquidation</button>
        {hash && (
          <div className="text-sm">
            <div>DEX path payment simulated (RWA → USDC swap)</div>
            <div>Hash: <span className="font-mono">{hash}</span></div>
            <div className="mt-2">Liquidation happened without public knowing the collateral amount</div>
          </div>
        )}
      </div>
    </div>
  )
}

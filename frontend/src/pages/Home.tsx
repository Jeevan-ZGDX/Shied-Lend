import { useEffect, useState } from 'react'
import { useWallet } from '@/context/WalletContext'

export default function Home() {
  const { address, balance } = useWallet()
  const [stats, setStats] = useState({ tvl: '12.3M', loans: 128, privacyScore: 0.97 })

  useEffect(() => {
    setTimeout(() => {
      setStats({ tvl: '12.8M', loans: 132, privacyScore: 0.97 })
    }, 1500)
  }, [])

  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">The Privacy Layer for Institutional Finance on Stellar</h1>
        <p className="text-gray-300">Borrow against RWAs without revealing your position</p>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-gray-300 text-sm">Total Value Locked</div>
          <div className="text-2xl font-semibold mt-1">${stats.tvl}</div>
        </div>
        <div className="card">
          <div className="text-gray-300 text-sm">Active Loans</div>
          <div className="text-2xl font-semibold mt-1">{stats.loans}</div>
        </div>
        <div className="card">
          <div className="text-gray-300 text-sm">Privacy Score</div>
          <div className="text-2xl font-semibold mt-1">{(stats.privacyScore * 100).toFixed(0)}%</div>
        </div>
      </section>
      <section className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-300">Wallet</div>
            <div className="font-mono text-sm">{address ?? 'Not connected'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-300">XLM Balance</div>
            <div className="font-mono text-sm">{balance ?? '-'}</div>
          </div>
        </div>
      </section>
    </div>
  )
}

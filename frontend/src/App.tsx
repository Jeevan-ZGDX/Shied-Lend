import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Deposit from './pages/Deposit'
import Borrow from './pages/Borrow'
import Manage from './pages/Manage'
import Liquidation from './pages/Liquidation'
import { useWallet } from './context/WalletContext'

export default function App() {
  const { address, connect, installed, disconnect, isConnecting } = useWallet()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1f2752] bg-[#0b1026]/80 sticky top-0 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-stellar-blue animate-pulseShield" />
            <div>
              <div className="text-lg font-semibold">ShieldLend</div>
              <div className="text-xs text-gray-300">Privacy without Transparency</div>
            </div>
            <span className="ml-3 text-xs px-2 py-1 rounded bg-[#12183a] border border-[#1f2752]">Protocol 25 (X-Ray)</span>
          </div>
          <nav className="flex items-center gap-4">
            <NavLink to="/" className="text-sm hover:text-white text-gray-300">Home</NavLink>
            <NavLink to="/deposit" className="text-sm hover:text-white text-gray-300">Deposit</NavLink>
            <NavLink to="/borrow" className="text-sm hover:text-white text-gray-300">Borrow</NavLink>
            <NavLink to="/manage" className="text-sm hover:text-white text-gray-300">Manage</NavLink>
            <NavLink to="/liquidation" className="text-sm hover:text-white text-gray-300">Liquidation</NavLink>
          </nav>
          <div>
            {installed ? (
              address ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <span className="text-gray-300">Connected:</span> <span className="font-mono">{formatAddress(address)}</span>
                  </div>
                  <button
                    onClick={disconnect}
                    className="text-xs px-3 py-1 rounded bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600/30 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={connect}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )
            ) : (
              <a className="btn btn-primary" href="https://freighter.app" target="_blank" rel="noopener noreferrer">Install Freighter</a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/borrow" element={<Borrow />} />
          <Route path="/manage" element={<Manage />} />
          <Route path="/liquidation" element={<Liquidation />} />
        </Routes>
      </main>
    </div>
  )
}

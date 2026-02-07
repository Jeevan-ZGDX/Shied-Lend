import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as freighter from '@stellar/freighter-api'
import { PASSPHRASE, HORIZON } from '@/lib/stellar'
import toast from 'react-hot-toast'

type WalletContextType = {
  installed: boolean
  address: string | null
  balance: string | null
  connect: () => Promise<void>
  signAndSubmit: (xdr: string, networkPassphrase: string) => Promise<{ hash: string }>
  disconnect: () => void
  isConnecting: boolean
}

const WalletContext = createContext<WalletContextType>({
  installed: false,
  address: null,
  balance: null,
  connect: async () => {},
  signAndSubmit: async () => ({ hash: '' }),
  disconnect: () => {},
  isConnecting: false
})

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [installed, setInstalled] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const network = useMemo(() => (import.meta.env.VITE_STELLAR_NETWORK ?? 'TESTNET') as 'TESTNET' | 'PUBLIC', [])
  const passphrase = network === 'PUBLIC' ? 'Public Global Stellar Network ; September 2015' : 'Test SDF Network ; September 2015'

  useEffect(() => {
    const checkInstallation = async () => {
      try {
        // Check if Freighter is installed
        if (typeof window !== 'undefined' && (window as any).freighterApi) {
          setInstalled(true)
          return
        }

        // Try using the freighter package methods
        const api = freighter as any
        if (typeof api.isConnected === 'function') {
          const connected = await api.isConnected()
          setInstalled(connected)
        } else if (typeof api.isFreighter === 'function') {
          const isFreighter = await api.isFreighter()
          setInstalled(isFreighter)
        } else {
          setInstalled(false)
        }
      } catch (error) {
        console.warn('Freighter detection error:', error)
        setInstalled(false)
      }
    }

    checkInstallation()
  }, [])

  useEffect(() => {
    if (!address) return
    fetch(`${HORIZON}/accounts/${address}`)
      .then(r => r.json())
      .then((acc: any) => {
        const bal = acc.balances?.find((b: any) => b.asset_type === 'native')?.balance ?? null
        setBalance(bal)
      })
      .catch(() => setBalance(null))
  }, [address])

  const connect = async () => {
    if (!installed) {
      toast.error('Freighter wallet not detected. Please install the extension.')
      return
    }

    setIsConnecting(true)
    try {
      // Get the Freighter API instance
      const api = (window as any).freighterApi || (freighter as any)
      
      // Request permission to connect
      if (typeof api.setAllowed === 'function') {
        const allowed = await api.setAllowed()
        if (!allowed) {
          throw new Error('Freighter access denied by user')
        }
      }

      // Get public key
      let publicKey: string
      if (typeof api.getPublicKey === 'function') {
        publicKey = await api.getPublicKey()
      } else if (typeof (freighter as any).getPublicKey === 'function') {
        publicKey = await (freighter as any).getPublicKey()
      } else {
        throw new Error('Unable to access Freighter wallet')
      }

      if (!publicKey) {
        throw new Error('No public key returned from Freighter')
      }

      setAddress(publicKey)
      toast.success('Wallet connected successfully!')
    } catch (error: any) {
      console.error('Wallet connection error:', error)
      
      // Provide specific error messages
      if (error.message?.includes('denied')) {
        toast.error('Connection denied. Please allow access in Freighter.')
      } else if (error.message?.includes('not installed')) {
        toast.error('Freighter wallet not installed. Please install the extension.')
      } else {
        toast.error(`Connection failed: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setBalance(null)
    toast.success('Wallet disconnected')
  }

  const signAndSubmit = async (xdr: string, networkPassphrase: string = passphrase) => {
    const signed = await freighter.signTransaction(xdr, { network: networkPassphrase })
    const params = new URLSearchParams({ tx: signed as unknown as string })
    const res = await fetch(`${HORIZON}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })
    const data = await res.json()
    return { hash: data.hash }
  }

  return (
    <WalletContext.Provider value={{ installed, address, balance, connect, signAndSubmit, disconnect, isConnecting }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)

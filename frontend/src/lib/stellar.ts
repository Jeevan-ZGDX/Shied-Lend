import { Account, Asset, Memo, Operation, TransactionBuilder } from 'stellar-sdk'

export type ContractsConfig = {
  vault: string
  lending_pool: string
  liquidator: string
}

export async function fetchContracts(): Promise<ContractsConfig> {
  const res = await fetch('/contracts.json')
  return res.json()
}

export const HORIZON = (import.meta.env.VITE_STELLAR_NETWORK ?? 'TESTNET') === 'PUBLIC'
  ? 'https://horizon.stellar.org'
  : 'https://horizon-testnet.stellar.org'

export const PASSPHRASE = (import.meta.env.VITE_STELLAR_NETWORK ?? 'TESTNET') === 'PUBLIC'
  ? 'Public Global Stellar Network ; September 2015'
  : 'Test SDF Network ; September 2015'

export async function buildManageDataTx(address: string, key: string, value: string) {
  const acc = await fetch(`${HORIZON}/accounts/${address}`).then(r => r.json())
  const account = new Account(address, acc.sequence)
  const tx = new TransactionBuilder(account as unknown as Account, {
    fee: '100',
    networkPassphrase: PASSPHRASE
  })
    .addOperation(Operation.manageData({ name: key, value }))
    .addMemo(Memo.text('shieldlend'))
    .setTimeout(60)
    .build()
  return tx
}

export async function simulatePathPayment(address: string, sendAmount: string) {
  const acc = await fetch(`${HORIZON}/accounts/${address}`).then(r => r.json())
  const account = new Account(address, acc.sequence)
  const usdc = new Asset('USDC', 'GA5ZSEJYB37I3W52MRG4E232SCDAD4W7DUR4B3C5XQHE2LUV6ZEMBGOI') // example issuer on testnet
  const tx = new TransactionBuilder(account as unknown as Account, {
    fee: '100',
    networkPassphrase: PASSPHRASE
  })
    .addOperation(
      Operation.pathPaymentStrictSend({
        sendAsset: Asset.native(),
        sendAmount,
        destination: address,
        destAsset: usdc,
        destMin: '0.1',
        path: []
      })
    )
    .addMemo(Memo.text('liquidation-demo'))
    .setTimeout(60)
    .build()
  return tx
}

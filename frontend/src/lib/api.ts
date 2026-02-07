import axios from 'axios'

const API_BASE = 'http://localhost:3001/api'

export async function generateDepositProof(asset: string, amount: string) {
  const start = performance.now()
  const { data } = await axios.post(`${API_BASE}/generate-deposit-proof`, { asset, amount })
  const elapsedMs = Math.round(performance.now() - start)
  return { ...data, elapsedMs }
}

export async function generateLoanProof(depositId: string, loanAmount: string) {
  const start = performance.now()
  const { data } = await axios.post(`${API_BASE}/generate-loan-proof`, { depositId, loanAmount })
  const elapsedMs = Math.round(performance.now() - start)
  return { ...data, elapsedMs }
}

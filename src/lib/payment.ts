import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'

export const PLATFORM_WALLET = process.env.PLATFORM_WALLET || 'CLeafjb6iuHiHknDNKhVuAVcqytMxrJdESopZcwCw1bj'
const SOLANA_RPC = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com'

let cachedPrice: { price: number; ts: number } | null = null

export async function getSOLPrice(): Promise<number> {
  if (cachedPrice && Date.now() - cachedPrice.ts < 60_000) return cachedPrice.price
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', { next: { revalidate: 60 } })
    const data = await res.json()
    const price = data.solana?.usd || 150
    cachedPrice = { price, ts: Date.now() }
    return price
  } catch {
    return cachedPrice?.price || 150
  }
}

export async function usdToSOL(usd: number): Promise<number> {
  const price = await getSOLPrice()
  return parseFloat((usd / price).toFixed(6))
}

export function generatePaymentReference(): string {
  return `um_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export async function verifyPayment(signature: string): Promise<{ confirmed: boolean; error?: string }> {
  try {
    const connection = new Connection(SOLANA_RPC, 'confirmed')
    const tx = await connection.getTransaction(signature, { maxSupportedTransactionVersion: 0 })
    if (!tx) return { confirmed: false, error: 'Transaction not found' }
    if (tx.meta?.err) return { confirmed: false, error: 'Transaction failed' }
    return { confirmed: true }
  } catch (e: any) {
    return { confirmed: false, error: e.message }
  }
}

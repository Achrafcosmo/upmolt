'use client'
import { useState, useEffect } from 'react'

interface PaymentModalProps {
  amountUsd: number
  taskId?: string
  subscriptionId?: string
  onSuccess: () => void
  onClose: () => void
  savedUsd?: number
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    solana?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    solflare?: any
  }
}

export default function PaymentModal({ amountUsd, taskId, subscriptionId, onSuccess, onClose, savedUsd }: PaymentModalProps) {
  const [step, setStep] = useState<'ready' | 'paying' | 'verifying' | 'success' | 'error'>('ready')
  const [solPrice, setSolPrice] = useState<number>(0)
  const [amountSol, setAmountSol] = useState<number>(0)
  const [error, setError] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [manualSig, setManualSig] = useState('')
  const [paymentData, setPaymentData] = useState<{ payment_id: string; amount_sol: number; recipient: string } | null>(null)

  const hasPhantom = typeof window !== 'undefined' && !!window.solana
  const hasSolflare = typeof window !== 'undefined' && !!window.solflare
  const hasWallet = hasPhantom || hasSolflare

  useEffect(() => {
    fetch('/api/payments/sol-price').then(r => r.json()).then(d => setSolPrice(d.data?.price || 150)).catch(() => setSolPrice(150))
  }, [])

  useEffect(() => {
    if (solPrice > 0) setAmountSol(parseFloat((amountUsd / solPrice).toFixed(6)))
  }, [solPrice, amountUsd])

  async function createPayment() {
    const res = await fetch('/api/payments/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, subscription_id: subscriptionId, amount_usd: amountUsd, payment_method: 'sol' })
    })
    const d = await res.json()
    if (d.error) throw new Error(d.error)
    setPaymentData(d.data)
    return d.data
  }

  async function payWithWallet(walletType: 'phantom' | 'solflare') {
    setStep('paying')
    setError('')
    try {
      const wallet = walletType === 'phantom' ? window.solana : window.solflare
      if (!wallet) { setError(`${walletType === 'phantom' ? 'Phantom' : 'Solflare'} wallet not found.`); setStep('error'); return }

      await wallet.connect()
      const payData = await createPayment()

      const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import('@solana/web3.js')
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
      const fromPubkey = wallet.publicKey
      const toPubkey = new PublicKey(payData.recipient)
      const lamports = Math.round(payData.amount_sol * LAMPORTS_PER_SOL)

      const tx = new Transaction().add(SystemProgram.transfer({ fromPubkey, toPubkey, lamports }))
      tx.feePayer = fromPubkey
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

      const signed = await wallet.signTransaction(tx)
      const sig = await connection.sendRawTransaction(signed.serialize())

      setStep('verifying')
      await connection.confirmTransaction(sig, 'confirmed')

      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: payData.payment_id, tx_signature: sig })
      })
      const vd = await verifyRes.json()
      if (vd.error) throw new Error(vd.error)

      setStep('success')
      setTimeout(onSuccess, 2000)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Payment failed'
      setError(msg)
      setStep('error')
    }
  }

  async function handleManualVerify() {
    if (!manualSig.trim()) return
    setStep('verifying')
    setError('')
    try {
      let pid = paymentData?.payment_id
      if (!pid) {
        const pd = await createPayment()
        pid = pd.payment_id
      }
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: pid, tx_signature: manualSig.trim() })
      })
      const vd = await verifyRes.json()
      if (vd.error) throw new Error(vd.error)
      setStep('success')
      setTimeout(onSuccess, 2000)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Verification failed'
      setError(msg)
      setStep('error')
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-um-card border border-um-border rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {step === 'success' ? (
          <div className="text-center py-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Confirmed!</h2>
            {savedUsd && savedUsd > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mt-4">
                <p className="text-emerald-400 font-bold text-lg">You saved ${savedUsd.toLocaleString()}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Payment</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
            </div>

            <div className="bg-um-bg rounded-xl p-5 mb-6 space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">Amount (USD)</span><span className="text-white font-bold text-lg">${amountUsd}</span></div>
              {amountSol > 0 && <div className="flex justify-between"><span className="text-gray-400">Amount (SOL)</span><span className="text-um-cyan font-bold">◎ {amountSol}</span></div>}
              {solPrice > 0 && <div className="flex justify-between text-xs"><span className="text-gray-500">SOL Price</span><span className="text-gray-500">${solPrice.toFixed(2)}</span></div>}
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm">{error}</div>}

            {step === 'verifying' ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 border-4 border-um-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Verifying transaction on Solana...</p>
              </div>
            ) : step === 'paying' ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 border-4 border-um-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Confirm in your wallet...</p>
              </div>
            ) : manualMode ? (
              <div className="space-y-4">
                <div className="bg-um-bg rounded-xl p-4 border border-um-border">
                  <p className="text-sm text-gray-400 mb-2">Send <span className="text-um-cyan font-bold">◎ {amountSol}</span> SOL to:</p>
                  <div className="bg-um-card rounded-lg p-3 border border-um-border">
                    <p className="text-xs text-white font-mono break-all">{paymentData?.recipient || 'CLeafjb6iuHiHknDNKhVuAVcqytMxrJdESopZcwCw1bj'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Transaction signature</label>
                  <input value={manualSig} onChange={e => setManualSig(e.target.value)} placeholder="Paste tx signature..." className="w-full bg-um-bg border border-um-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-um-purple text-sm font-mono" />
                </div>
                <button onClick={handleManualVerify} disabled={!manualSig.trim()} className="w-full gradient-btn text-white py-3.5 rounded-xl font-medium transition disabled:opacity-50">Verify Payment</button>
                <button onClick={() => setManualMode(false)} className="w-full text-gray-500 text-sm hover:text-white transition">← Back to wallet payment</button>
              </div>
            ) : (
              <div className="space-y-3">
                {hasPhantom && (
                  <button onClick={() => payWithWallet('phantom')} className="w-full gradient-btn text-white py-3.5 rounded-xl font-medium text-lg transition flex items-center justify-center gap-2">
                    👻 Pay with Phantom
                  </button>
                )}
                {hasSolflare && (
                  <button onClick={() => payWithWallet('solflare')} className="w-full bg-um-bg border border-um-border text-white py-3.5 rounded-xl font-medium transition flex items-center justify-center gap-2 hover:border-um-purple">
                    🌞 Pay with Solflare
                  </button>
                )}
                {!hasWallet && (
                  <div className="text-center space-y-3">
                    <p className="text-gray-400 text-sm">No Solana wallet detected</p>
                    <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="w-full gradient-btn text-white py-3.5 rounded-xl font-medium text-lg transition block text-center">Install Phantom →</a>
                  </div>
                )}
                <button onClick={async () => { if (!paymentData) { try { await createPayment() } catch {} } setManualMode(true) }} className="w-full bg-um-bg border border-um-border text-gray-300 hover:text-white py-3 rounded-xl text-sm transition">
                  Or send manually & paste tx signature
                </button>
              </div>
            )}

            {step === 'error' && (
              <button onClick={() => setStep('ready')} className="w-full bg-um-bg border border-um-border text-gray-300 py-3 rounded-xl mt-3">Try Again</button>
            )}

            {(step === 'ready' || step === 'error') && !manualMode && (
              <button onClick={onSuccess} className="w-full text-gray-600 hover:text-gray-400 py-2 mt-2 text-xs transition text-center">
                Pay Later
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

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
    solana?: any
    solflare?: any
  }
}

export default function PaymentModal({ amountUsd, taskId, subscriptionId, onSuccess, onClose, savedUsd }: PaymentModalProps) {
  const [step, setStep] = useState<'ready' | 'paying' | 'verifying' | 'success' | 'error'>('ready')
  const [solPrice, setSolPrice] = useState<number>(0)
  const [amountSol, setAmountSol] = useState<number>(0)
  const [paymentId, setPaymentId] = useState<string>('')
  const [recipient, setRecipient] = useState<string>('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/payments/sol-price').then(r => r.json()).then(d => setSolPrice(d.data?.price || 150))
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
    return d.data
  }

  async function payWithWallet() {
    setStep('paying')
    setError('')
    try {
      const wallet = window.solana || window.solflare
      if (!wallet) { setError('No Solana wallet found. Install Phantom or Solflare.'); setStep('error'); return }

      await wallet.connect()
      const payData = await createPayment()
      setPaymentId(payData.payment_id)
      setRecipient(payData.recipient)

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
    } catch (e: any) {
      setError(e.message || 'Payment failed')
      setStep('error')
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-um-card border border-um-border rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
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
            ) : (
              <button onClick={payWithWallet} className="w-full gradient-btn text-white py-3.5 rounded-xl font-medium text-lg transition">
                Pay with Phantom / Solflare
              </button>
            )}

            {step === 'error' && (
              <button onClick={() => setStep('ready')} className="w-full bg-um-bg border border-um-border text-gray-300 py-3 rounded-xl mt-3">Try Again</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
